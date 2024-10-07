import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { ID_LENGTH } from "@trustify/utils/constants";
import { z } from "zod";

export const LoginRequestSchema = z.object({
  client_id: z.string().length(ID_LENGTH),
  redirect_uri: z.string().url(),
  response_type: z.enum(oidcDiscovery.response_types_supported, {
    message: "Invalid response_type",
  }),
  code_challenge: z.string().optional(),
  code_challenge_method: z.enum(["S256", "plain"]).optional(),
  scope: z.string().refine((val) => val.includes("openid"), {
    message: "Missing required scope: openid",
  }),
  state: z.string().optional(),
  nonce: z.string().optional(),
});
