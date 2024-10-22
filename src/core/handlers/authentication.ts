import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { LoginFormSchema, LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { AuthenticationService } from "@trustify/core/services/authentication-service";
import { SessionService } from "@trustify/core/services/session-service";
import { requireAuth } from "@trustify/core/middlewares/require-auth";
import { Environment } from "@trustify/config/environment";
import { encodeUrl } from "@trustify/utils/encode-url";
import { zValidator } from "@hono/zod-validator";
import { setCookie } from "hono/cookie";
import { Hono } from "hono";

export const authenticationHandler = new Hono<HonoAppBindings>()
  .post(
    "/login",
    requireAuth,
    zValidator("query", LoginRequestSchema),
    zValidator("form", LoginFormSchema),
    async (c) => {
      // Validate user crendetials from the login form
      const credentials = c.req.valid("form");

      // Validate the login request from query params
      const loginRequest = c.req.valid("query");

      // Initialize authentication service
      const authenticationService = new AuthenticationService(loginRequest);

      // Get the user from the credentials passed via the login form
      const verifiedUser = await authenticationService.verifyUser(credentials);

      // Check if there is currently no active session
      // Authenticate the user with the passed credentials from initialization
      if (c.get("session") === null) {
        // Create a session object and store it in the database
        const sid = await authenticationService.authenticateUser(verifiedUser.id, c.req.raw.headers);

        // Set the session cookie in the user agent's browser cookie
        setCookie(c, sid.name, sid.value, sid.attributes);

        // Check if prompt parameter is not provided by the client or if prompt is "login"
        if (!loginRequest.prompt || loginRequest.prompt === "login") {
          // Initialize session servoce
          const sessionService = new SessionService();

          // Get the currently active session
          const sessionDetails = await sessionService.getSessionDetails(sid.value);

          // Check if consent has not yet been granted
          if (!sessionDetails.consentGrant) {
            // If so, generate the /consent url
            const consentUrl = encodeUrl({
              base: Environment.getPublicConfig().adminHost,
              path: "/consent",
              params: loginRequest,
            });

            // return the consent url back to the client
            return c.json({ url: consentUrl });
          }
        }
      }

      // If the client specified a prompt parameter, and it happens to contain "consent",
      // redirect the user agent to the /consent page
      if (loginRequest.prompt && loginRequest.prompt.includes("consent")) {
        // Generate the consent url
        const consentUrl = encodeUrl({
          base: Environment.getPublicConfig().adminHost,
          path: "/consent",
          params: loginRequest,
        });

        // Return the generated consent url back to the client
        return c.json({ url: consentUrl });
      }

      // Process the client's redirect_uri and return values requested by the client
      // according to what was specified in the response_type
      const callbackUrl = await authenticationService.redirectToCallback(verifiedUser.id);

      // Return the generated url back to the client
      return c.json({ url: callbackUrl });
    },
  )

  .post("/verify-password-hash")

  .get("get-authentication-details", requireAuth, async (c) => {
    // Initialize authentication service
    const sessionService = new SessionService();

    // Get user and client details from current session
    const details = await sessionService.getSessionDetails(c.get("session").id);

    // Return the authentication details
    return c.json(details);
  })

  .post("/authorize", requireAuth, zValidator("query", LoginRequestSchema), async (c) => {
    // Validate the loginRequest from query
    const loginRequest = c.req.valid("query");

    // Initialize the authentication service
    const authenticationService = new AuthenticationService(loginRequest);

    // Initialize the session service
    const sessionService = new SessionService();

    // Update consent grant to true
    await sessionService.updateConsent(c.get("session").id, true);

    // Process the client's redirect_uri and return values requested by the client
    // according to what was specified in the response_type
    const redirectUrl = await authenticationService.redirectToCallback(c.get("session").userId);

    // Return the generated url back to the client
    return c.json({ url: redirectUrl });
  })

  // TODO: implement logout
  .post("/logout", async () => {
    // invalidate session in the database
    // make sure to remove the sid in the redis cache as well
  });
