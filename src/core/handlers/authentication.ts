import { zValidator } from "@hono/zod-validator";
import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { LoginFormSchema, LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { AuthenticationService } from "@trustify/core/services/authentication-service";
import { Hono } from "hono";

export const authenticationHandler = new Hono<HonoAppBindings>().post(
  "/login",
  zValidator("query", LoginRequestSchema),
  zValidator("form", LoginFormSchema),
  async (c) => {
    // Validate user crendetials from the login form
    const credentials = c.req.valid("form");

    // Validate the login request from query params
    const loginRequest = c.req.valid("query");

    // Initialize authentication service
    const authenticationService = new AuthenticationService(credentials, c);

    // Get the user from the credentials passed via the login form
    const user = await authenticationService.getUserFromCredentials();

    // Authenticate the user with the passed credentials from initialization
    const tenant = await authenticationService.authenticateUser(user, loginRequest.client_id);

    return c.json({ tenant });
  },
);
