import { CLIENT_AUTHENTICATION_METHODS } from "@trustify/utils/constants";
import { z } from "zod";

export const ClientAuthenticationMethodSchema = z.enum(CLIENT_AUTHENTICATION_METHODS, {
  message: "Invalid token_endpoint_auth_method",
});
