import { zValidator } from "@hono/zod-validator";
import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { appConfig } from "@trustify/config/environment";
import { LoginFormSchema, LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { AuthenticationService } from "@trustify/core/services/authentication-service";
import { encodeUrl } from "@trustify/utils/encode-url";
import { Hono } from "hono";
import { requireAuth } from "../middlewares/require-auth";

export const authenticationHandler = new Hono<HonoAppBindings>()

  .post("/login", zValidator("query", LoginRequestSchema), zValidator("form", LoginFormSchema), async (c) => {
    // Validate user crendetials from the login form
    const credentials = c.req.valid("form");

    // Validate the login request from query params
    const loginRequest = c.req.valid("query");

    // Initialize authentication service
    const authenticationService = new AuthenticationService(c);

    // Get the user from the credentials passed via the login form
    const user = await authenticationService.getUser(credentials);

    // Authenticate the user with the passed credentials from initialization
    await authenticationService.authenticateUser(user);

    // Generate the consent URL
    const consentUrl = encodeUrl({
      base: appConfig.adminHost,
      path: "/consent",
      params: { ...loginRequest },
    });

    // Return the generated consent URL
    return c.json({ consentUrl });
  })

  .get("get-authentication-details", requireAuth, async (c) => {
    // Initialize authentication service
    const authenticationService = new AuthenticationService(c);

    // Get user and client details from current session
    const details = await authenticationService.getAuthenticationDetails(c.var.session);

    // Return the authentication details
    return c.json(details);
  })

  .post("/authorize", requireAuth, zValidator("query", LoginRequestSchema), async (c) => {
    // Validate the loginRequest from query
    const loginRequest = c.req.valid("query");

    // Initialize the authentication service
    const authenticationService = new AuthenticationService(c);

    // Generate authorization code and pass its payload
    const code = await authenticationService.generateAuthorizationCode({
      sid: c.var.session.id,
      userId: c.var.session.userId,
      clientId: c.var.session.clientId,
      redirectUri: loginRequest.redirect_uri,
      scope: loginRequest.scope,
      codeChallenge: loginRequest.code_challenge,
      codeMethod: loginRequest.code_challenge_method,
      nonce: loginRequest.nonce,
    });

    // Get the state from the store, and delete it after
    const state = await authenticationService.getStateFromStore(loginRequest.state);

    // Return the generated code and original state
    return c.json({ code, state });
  })

  // TODO: implement logout
  .post("/logout", async () => {
    // invalidate session in the database
    // make sure to remove the sid in the redis cache as well
  });
