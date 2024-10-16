import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { ID_LENGTH } from "@trustify/utils/constants";
import { z, ZodLiteral } from "zod";
import { SupportedGrantTypes } from "../types/oidc-supports";
import { LoginRequestSchema } from "./auth-schema";

export const TokenHeaderSchema = z.object({
  authorization: z.string().optional(),
});

export const TokenBodySchema = z.object({
  grant_type: z.union(
    oidcDiscovery.grant_types_supported.map((type) => z.literal(type)) as [
      ZodLiteral<SupportedGrantTypes>,
      ZodLiteral<SupportedGrantTypes>,
    ],
  ),
  code: z.string(),
  client_id: z.string().length(ID_LENGTH).optional(),
  client_secret: z.string().optional(),
  redirect_uri: z.string().url(),
  code_verifier: z.string().optional(),
  refresh_token: z.string().optional(),
});

export const AuthCodePayloadSchema = LoginRequestSchema.merge(
  z.object({ userId: z.string().length(ID_LENGTH) }),
);

// export const RequestClaimSchema = z.record(
//   z.enum(oidcDiscovery.claims_supported),
//   z.record(z.literal("essential"), z.boolean(), z.literal("values")).optional(),
//   z.union([z.array(z.string()), z.string()]),
// );

export const RequestClaimSchema = z.record(
  z.enum(oidcDiscovery.claims_supported),
  z.object({
    essential: z.boolean().optional().nullable(),
    values: z.union([z.string(), z.array(z.string())]).optional(),
  }),
);

export const ClaimsSchema = z.object({
  id_token: RequestClaimSchema.optional(),
  userinfo: RequestClaimSchema.optional(),
});
