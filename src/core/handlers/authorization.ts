import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { OidcError } from "@trustify/types/oidc-error";
import { encodeUrl } from "@trustify/utils/encode-url";
import { appConfig } from "@trustify/config/environment";
import { AuthorizationService } from "@trustify/core/services/authorization-service";
import { LoginRequestSchema } from "@trustify/core/schemas/auth-schema";

export const authorizationHandler = new Hono().get(
  "/",
  zValidator("query", LoginRequestSchema),
  async (c) => {
    // Extract the validated loginRequest from the query param
    const loginRequest = c.req.valid("query");

    // Initialize the authorization service
    const authorizationService = new AuthorizationService(loginRequest);

    try {
      // Get the client details from the database
      const client = await authorizationService.getClientFromAuthorizationURL();

      // Check if scopes are valid
      authorizationService.verifyScopes(client.scopes);

      // Check if redirect_uri is valid
      authorizationService.verifyRedirectUris(loginRequest.redirect_uri, client.redirectUris);

      // Check if response_type is registered, and if it is supported by Trustify
      authorizationService.verifyResponseType(loginRequest.response_type, client.responseTypes);

      // Generate a random string and associate it to the original state from request URL
      const state = await authorizationService.saveStateAsOpaque();

      // Generate the login URL
      const loginUrl = encodeUrl({
        base: appConfig.adminHost,
        path: "/login",
        params: { ...loginRequest, state },
      });

      // If all checks passed, redirect to the login page
      return c.redirect(loginUrl);

      // Catch the resulting errorgetClientFromAuthorizationRequest
    } catch (e) {
      if (e instanceof OidcError) {
        return c.json(
          {
            name: e.name,
            error: e.errorType,
            message: e.message,
            status: e.status,
          },
          e.status,
        );
      }
    }
  },
);
