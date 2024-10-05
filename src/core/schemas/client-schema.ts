import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { z } from "zod";

export const ClientAuthenticationMethodSchema = z.enum(oidcDiscovery.token_endpoint_auth_methods_supported, {
  message: "Invalid token_endpoint_auth_method",
});
