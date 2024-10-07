import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { encodeUrl } from "@trustify/utils/encode-url";
import { appConfig } from "@trustify/config/environment";
import { AuthorizationService } from "@trustify/core/services/authorization-service";
import { LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";

export const authorizationHandler = new Hono<HonoAppBindings>().get(
  "/",
  zValidator("query", LoginRequestSchema),
  async (c) => {
    // Extract the validated loginRequest from the query param
    const loginRequest = c.req.valid("query");

    // Initialize the authorization service
    const authorizationService = new AuthorizationService(loginRequest, c);

    // Get the client details from the database
    const client = await authorizationService.getClientFromAuthorizationURL();

    // Check if scopes are valid
    authorizationService.verifyScopes(client.scopes);

    // Check if redirect_uri is valid
    authorizationService.verifyRedirectUris(client.redirectUris);

    // Check if response_type is registered, and if it is supported by Trustify
    authorizationService.verifyResponseType(client.responseTypes);

    // Check if code_challenge_method is valid if code_challenge is provided
    authorizationService.verifyCodeChallengeMethod();

    // Generate a random string and associate it to the original state from request URL
    const opaqueState = await authorizationService.saveStateAsOpaque();

    // Generate the login URL
    const loginUrl = encodeUrl({
      base: appConfig.adminHost,
      path: "/login",
      params: { ...loginRequest, state: opaqueState },
    });

    // If all checks passed, redirect to the login page
    return c.redirect(loginUrl);
  },
);
