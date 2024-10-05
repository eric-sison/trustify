import { STATE_LENGTH } from "@trustify/utils/constants";
import { LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { OidcError } from "@trustify/types/oidc-error";
import { ClientRepository } from "@trustify/core/repositories/client-repository";
import { redisStore } from "@trustify/config/redis";
import { generateIdFromEntropySize } from "lucia";
import { z } from "zod";

type OidcScopes = (typeof oidcDiscovery.scopes_supported)[number];

type OidcResponseTypes = (typeof oidcDiscovery.response_types_supported)[number];

export class AuthorizationService {
  // Construct the AuthorizationService class by requiring the loginRequest retrieved from the URL
  constructor(private readonly loginRequest: z.infer<typeof LoginRequestSchema>) {}

  public async getClientFromAuthorizationURL() {
    // Initialize clientRepository to interact with the database
    const clientRepository = new ClientRepository();

    // Get the client from the database by the client_id from loginRequest
    const client = await clientRepository.getClientById(this.loginRequest.client_id);

    // Throw an error if client is not found
    if (!client) {
      throw new OidcError({
        error: "invalid_client",
        message: "Client not found!",
        status: 404,
      });
    }

    // Otherwise, return the client
    return client;
  }

  public verifyScopes(clientScopes: string[]) {
    // Ensure loginRequest.scope is a string and split it into an array
    const scopes = this.loginRequest?.scope?.split(" ") || [];

    // Utility function to check if a scope is a valid OIDC scope
    const isValidScope = (scope: string): scope is OidcScopes => {
      return oidcDiscovery.scopes_supported.includes(scope as OidcScopes);
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

  public verifyRedirectUris(redirectUri: string, registeredUris: string[]) {
    try {
      // Parse the URI to ensure it is well-formed
      const parsedUri = new URL(redirectUri);

      // Check if the redirect URI exactly matches any of the registered URIs
      const isRegisteredUri = registeredUris.includes(redirectUri);

      // Throw an OIDC Error if redirect_uri is not registered
      if (!isRegisteredUri) {
        throw new OidcError({
          error: "invalid_redirect_uri",
          message: "The supplied redirect_uri is not valid.",
          status: 400,
        });
      }

      // Log a warning if redirect URI does not use HTTPS
      if (parsedUri.protocol !== "https") {
        // TODO: logger - implement production logger
        console.warn(`Warning: Redirect URI is not encrypted! - ${parsedUri.origin}`);
      }

      // If the URL constructor throws an error, the URI is malformed
    } catch (error) {
      throw error;
    }
  }

  public verifyResponseType(responseType: string, allowedResponseTypes: string[]) {
    // The list of response types supported by the OIDC server.
    const supportedTypes = oidcDiscovery.response_types_supported;

    // Check if the response type is supported by the server
    const isValidResponseType = supportedTypes.includes(responseType as OidcResponseTypes);

    // Check if the client is allowed to use the specified response type
    const isAllowedForClient = allowedResponseTypes.includes(responseType);

    // Throw an error if the response type is invalid or not allowed
    if (!isValidResponseType || !isAllowedForClient) {
      throw new OidcError({
        error: "invalid_response_type",
        message: "The supplied response_type is not valid.",
        status: 400,
      });
    }
  }

  public async saveStateAsOpaque() {
    // Only execute this function if state is not undefined
    if (this.loginRequest.state) {
      try {
        // Generate a random ID that will be associated with the state
        // before storing it in the redis store
        const opaqueState = `stq_${generateIdFromEntropySize(STATE_LENGTH)}`;

        // Store the opaqueState in the redis store
        await redisStore.set(opaqueState, this.loginRequest.state, "EX", 60 * 15);

        // Return the generated state
        return opaqueState;

        // Throw an error if something went wrong in trying to store the state in the redis
      } catch (error) {
        // TODO: logger - implement production logger
        console.error(error);

        // Throw error if storing state to redis has failed
        throw new OidcError({
          error: "redis_set_failed",
          message: "Failed to set value to redis store.",
          status: 500,
        });
      }
    }
  }
}
