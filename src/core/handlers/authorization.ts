import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AuthorizationService } from "@trustify/core/services/authorization-service";
import { LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { getCookie } from "hono/cookie";
import { ClientService } from "../services/client-service";
import { lucia } from "@trustify/config/lucia";

export const authorizationHandler = new Hono<HonoAppBindings>().get(
  "/",
  zValidator("query", LoginRequestSchema),
  async (c) => {
    // Extract the validated loginRequest from the query param
    const loginRequest = c.req.valid("query");

    // Get the currently active session (if not undefined)
    const session = getCookie(c, lucia.sessionCookieName);

    // Initialize the authorization service
    const authorizationService = new AuthorizationService(loginRequest);

    // Initialize the client service
    const clientService = new ClientService();

    // Get the client details from the database
    const client = await clientService.getClientById(loginRequest.client_id);

    // Generate a random string and associate it to the original state from request URL
    // Note that opaqueState can be undefined. This is due to the fact that state parameter is optional
    await authorizationService.verifyAuthorizationRequest(client);

    // Build the url to redirect from /authorization
    const url = await authorizationService.redirectFromAuthorizationEndpoint(session);

    // Redirect to url
    return c.redirect(url);
  },
);
