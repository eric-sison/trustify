import { ID_LENGTH } from "@trustify/utils/constants";
import { z } from "zod";

export const TokenHeaderSchema = z.object({
  authorization: z.string().optional(),
});

export const TokenBodySchema = z.object({
  grant_type: z.string(),
  code: z.string(),
  client_id: z.string().length(ID_LENGTH).optional(),
  client_secret: z.string().optional(),
  redirect_uri: z.string().url(),
  code_verifier: z.string().optional(),
});

export const AuthCodePayloadSchema = z.object({
  sid: z.string(),
  userId: z.string().length(ID_LENGTH),
  clientId: z.string().length(ID_LENGTH),
  redirectUri: z.string().url(),
  scope: z.string(),
  codeChallenge: z.string().optional(),
  codeMethod: z.string().optional(),
  nonce: z.string().optional(),
});
