import { SupportedResponseTypes } from "@trustify/core/types/oidc-supports";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { ID_LENGTH } from "@trustify/utils/constants";
import { z, ZodLiteral } from "zod";

export const LoginRequestSchema = z.object({
  client_id: z.string().length(ID_LENGTH),
  redirect_uri: z.string().url(),
  response_type: z.union(
    oidcDiscovery.response_types_supported.map((type) => z.literal(type)) as [
      ZodLiteral<SupportedResponseTypes>,
      ZodLiteral<SupportedResponseTypes>,
    ],
  ),
  code_challenge: z.string().optional(),
  code_challenge_method: z.enum(["S256", "plain"]).optional(),
  scope: z.string().refine((val) => val.includes("openid"), {
    message: "Missing required scope: openid",
  }),
  claims: z.string().optional(),
  state: z.string().optional(),
  prompt: z
    .union([z.literal("login"), z.literal("consent"), z.literal("login consent"), z.literal("none")])
    .optional(),
  nonce: z.string().optional(),
  display: z.union([z.literal("page"), z.literal("popup"), z.literal("touch")]).optional(),
});

export const LoginFormSchema = z.object({
  email: z.string().email({
    message: "Must be a valid email.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
});

export const UserRegistrationFormSchema = z.object({
  email: z.string().email({
    message: "Must be a valid email.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
  preferredUsername: z.string().min(5, {
    message: "Username must be at least 5 characters long.",
  }),
  phoneNumber: z.string().min(1, {
    message: "Please provide a mobile number.",
  }),
  emailVerified: z.boolean(),
});
