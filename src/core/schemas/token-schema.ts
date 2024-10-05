import { ID_LENGTH } from "@trustify/utils/constants";
import { z } from "zod";

export const TokenRequestSchema = z.object({
  grant_type: z.string(),
  code: z.string(),
  client_id: z.string().length(ID_LENGTH),
  client_secret: z.string().optional(),
  redirect_uri: z.string().url(),
  code_verifier: z.string().optional(),
});
