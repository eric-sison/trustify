import { AUTH_CODE_LENGTH } from "@trustify/utils/constants";
import { LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { OidcError } from "@trustify/core/types/oidc-error";
import { SupportedResponseTypes, SupportedScopes } from "@trustify/core/types/oidc-supports";
import { SessionService } from "@trustify/core/services/session-service";
import { redisStore } from "@trustify/config/redis";
import { generateIdFromEntropySize } from "lucia";
import { clients } from "@trustify/db/schema/clients";
import { AuthCodePayloadSchema } from "../schemas/token-schema";
import { encodeUrl } from "@trustify/utils/encode-url";
import { Environment } from "@trustify/config/environment";
import { z } from "zod";
import pretty from "pino-pretty";
import pino from "pino";

export class AuthorizationService {
  // Initialize environment config for reuse
  private readonly config = Environment.getPublicConfig();

  // Construct the AuthorizationService class by requiring the loginRequest retrieved from the URL
  constructor(private readonly loginRequest: z.infer<typeof LoginRequestSchema>) {}

  public async verifyAuthorizationRequest(client: typeof clients.$inferInsert) {
    this.verifyClientStatus(client.isActive!);

    // Check if scopes are valid
    this.verifyScopes(client.scopes!);

    // Check if redirect_uri is valid
    this.verifyRedirectUris(client.redirectUris!);

    // Check if response_type is registered, and if it is supported by Trustify
    this.verifyResponseType(client.responseTypes!);

    // Check if code_challenge_method is valid if code_challenge is provided
    this.verifyCodeChallengeMethod();
  }

  public async generateAuthorizationCode(payload: z.infer<typeof AuthCodePayloadSchema>) {
    // Validate the payload before storing in redis
    const validatedPayload = AuthCodePayloadSchema.safeParse(payload);

    // Throw an error if payload is not valid
    if (!validatedPayload.success) {
      throw new OidcError({
        error: "code_payload_malformed",
        message: "Make sure your authorization code's payload is valid.",
        status: 400,
      });
    }

    try {
      // Generate authorization code
      const authorizationCode = `auc_${generateIdFromEntropySize(AUTH_CODE_LENGTH)}`;

      // Attempt to store it in redis
      await redisStore.set(authorizationCode, JSON.stringify(validatedPayload.data), "EX", 60 * 5);

      // Return the generated authorization code
      return authorizationCode;

      // Handle redis error
    } catch (error) {
      // Throw error if storing state to redis has failed
      throw new OidcError({
        error: "redis_set_failed",
        message: "Failed to set value to redis store.",
        status: 500,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }

  public async redirectFromAuthorizationEndpoint(sessionId: string | undefined) {
    // Check if the client supplied a prompt parameter in the authorization request
    if (this.loginRequest.prompt) {
      // If loginRequest.prompt contains 'login', it will force the user to reauthenticate,
      // even with active session, by constructing a URL for redirection to the
      // login page with additional parameters.
      if (this.loginRequest.prompt.includes("login")) {
        // Construct the URL and redirect to /login, passing all the
        // loginRequest parameters, which will trigger the rendering of login form,
        // forcing the user to reauthenticate.
        return encodeUrl({
          base: this.config.adminHost,
          path: "/login",
          params: this.loginRequest,
        });

        // Check if the loginRequest.prompt property is equal to "consent". If the condition is
        // true, the code constructs a URL by encoding the parameters using the `encodeUrl` function.
        // The URL is built with the base URL from the public configuration's admin host, the path
        // "/consent", and additional parameters including the `loginRequest` object and the `state`
        // variable. Finally, the constructed URL is returned.
      } else if (this.loginRequest.prompt === "consent") {
        // Redirect to the /consent page, passing all the loginRequest parameters.
        // If there is an active session, the consent form will render. Otherwise,
        // the user-agent will be redirected back to the login page.
        return encodeUrl({
          base: this.config.adminHost,
          path: "/consent",
          params: this.loginRequest,
        });
      }

      // Checks if the `loginRequest.prompt` property is equal to "none". If it is, the code
      // then checks if there is no active session (`!session`). If there is no active session,
      // it throws an unauthorized error using the `OidcError` class with
      // specific error details such as error type, message, and status code (401). This code is
      // part of a login/authentication flow where it enforces authorization checks based on
      // the presence of an active session.
      else if (this.loginRequest.prompt === "none") {
        // Check if there is no active session
        if (!sessionId) {
          // If so, throw an unauthorized error
          throw new OidcError({
            error: "unauthorized",
            message: "You are not authorized to perform this action.",
            status: 401,
          });
        }

        // Initializr authenticationService
        const sessionService = new SessionService();

        // Get the details of the currently active session
        const { userId } = await sessionService.getSessionDetails(sessionId);

        // Handle response_types
        if (this.loginRequest.response_type === "code") {
          return await this.authorizationCodeFlow(userId);
        }

        if (this.loginRequest.response_type === "code token") {
          // TODO: Implement flow
          return await this.hybridFlowCodeToken();
        }

        if (this.loginRequest.response_type === "code id_token") {
          // TODO: Implement flow
          return await this.hybridFlowCodeIdToken();
        }

        if (this.loginRequest.response_type === "code id_token token") {
          // TODO: Implement flow
          return await this.hybridFlowCodeIdTokenToken();
        }
      }

      // Throw an error if the user passed an unsupported prompt during authorization.
      else {
        throw new OidcError({
          error: "unsupported_prompt",
          message: "Authentication prompt is not supported.",
          status: 400,
        });
      }
    }

    return encodeUrl({
      base: this.config.adminHost,
      path: "/login",
      params: this.loginRequest,
    });
  }

  public async authorizationCodeFlow(userId: string) {
    const code = await this.generateAuthorizationCode({ userId, ...this.loginRequest });

    const redirectUri = encodeUrl({
      base: this.loginRequest.redirect_uri,
      params: {
        code,
        state: this.loginRequest.state,
      },
    });

    return redirectUri;
  }

  public async hybridFlowCodeIdToken() {
    return "";
  }

  public async hybridFlowCodeToken() {
    return "";
  }

  public async hybridFlowCodeIdTokenToken() {
    return "";
  }

  private verifyClientStatus(isActive: boolean) {
    if (!isActive) {
      throw new OidcError({
        error: "inactive_client",
        message: "The client is currently inactive.",
        status: 400,
      });
    }
  }

  private verifyScopes(clientScopes: string[]) {
    // Ensure loginRequest.scope is a string and split it into an array
    const scopes = this.loginRequest?.scope?.split(" ") || [];

    // Utility function to check if a scope is a valid OIDC scope
    const isValidScope = (scope: string): scope is SupportedScopes => {
      return oidcDiscovery.scopes_supported.includes(scope as SupportedScopes);
    };

    // Verify that all requested scopes are supported both by the OIDC server and by the client
    const valid = scopes.every((scope) => {
      return isValidScope(scope) && clientScopes.includes(scope);
    });

    // Throw an error if any or all of the scopes are not valid
    if (!valid) {
      throw new OidcError({
        error: "invalid_scope",
        message: "The request contains invalid scopes.",
        status: 400,
      });
    }
  }

  private verifyRedirectUris(registeredUris: string[]) {
    try {
      // Parse the URI to ensure it is well-formed
      const parsedUri = new URL(this.loginRequest.redirect_uri);

      // Check if the redirect URI exactly matches any of the registered URIs
      const isRegisteredUri = registeredUris.includes(this.loginRequest.redirect_uri);

      // Throw an OIDC Error if redirect_uri is not registered
      if (!isRegisteredUri) {
        throw new OidcError({
          error: "invalid_redirect_uri",
          message: "The supplied redirect_uri is not valid.",
          status: 400,
        });
      }

      // Log a warning if redirect URI does not use HTTPS
      if (parsedUri.protocol !== "https:") {
        pino(pretty()).warn(`Redirect URI (${parsedUri.origin}) is not encrypted!`);
      }

      // If the URL constructor throws an error, the URI is malformed
    } catch (error) {
      throw new OidcError({
        error: "invalid_redirect_uri",
        message: "The supplied redirect_uri is not valid.",
        status: 400,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }

  private verifyResponseType(allowedResponseTypes: string[]) {
    // The list of response types supported by the OIDC server.
    const supportedTypes = oidcDiscovery.response_types_supported;

    // Check if the response type is supported by the server
    const isValidResponseType = supportedTypes.includes(
      this.loginRequest.response_type as SupportedResponseTypes,
    );

    // Check if the client is allowed to use the specified response type
    const isAllowedForClient = allowedResponseTypes.includes(this.loginRequest.response_type);

    // Throw an error if the response type is invalid or not allowed
    if (!isValidResponseType || !isAllowedForClient) {
      throw new OidcError({
        error: "unsupported_response_type",
        message: "The supplied response_type is not valid.",
        status: 400,
      });
    }
  }

  private verifyCodeChallengeMethod() {
    // If code_challenge is provided, ensure code_challenge_method is also provided
    if (this.loginRequest.code_challenge && !this.loginRequest.code_challenge_method) {
      throw new OidcError({
        error: "invalid_request",
        message: "When code_challenge is provided, code_challenge_method is also required",
        status: 400,
      });
    }
  }
}
