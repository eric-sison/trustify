import { z } from "zod";

export const EnvSchema = z.object({
  adminHost: z.string().url(),
  dbHost: z.string(),
  dbPort: z.coerce.number(),
  dbUser: z.string(),
  dbPassword: z.string(),
  dbName: z.string(),
  redisHost: z.string(),
  redisPort: z.coerce.number(),
  redisPassword: z.string().optional(),
  masterKeyEncryptionSecret: z.string().length(32),
});