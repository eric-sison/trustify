import { ID_LENGTH } from "@trustify/utils/constants";
import { z } from "zod";

export const TokenHeaderSchema = z.object({
  authorization: z.string().optional(),
});

export const TokenRequestSchema = z.object({
  grant_type: z.string(),
  code: z.string(),
  client_id: z.string().length(ID_LENGTH).optional(),
  client_secret: z.string().optional(),
  redirect_uri: z.string().url(),
  code_verifier: z.string().optional(),
});
