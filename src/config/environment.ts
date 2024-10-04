import { EnvSchema } from "@trustify/types/env-schema";
import { validateEnv } from "@trustify/utils/validate-env";

const env = {
  adminHost: process.env.NEXT_PUBLIC_ADMIN_HOST!, // this can also be accessed on the client side
  dbHost: process.env.DB_HOST!,
  dbPort: parseInt(process.env.DB_PORT!),
  dbUser: process.env.DB_USER!,
  dbPassword: process.env.DB_PASS!,
  dbName: process.env.DB_NAME!,
  redisHost: process.env.REDIS_HOST!,
  redisPort: parseInt(process.env.REDIS_PORT!),
  redisPassword: process.env.REDIS_PASS,
  issuer: process.env.IDP_ISSUER!,
  masterKeyEncryptionSecret: process.env.MASTER_KEY_ENCRYPTION_SECRET!,
};

export const appConfig = validateEnv<typeof EnvSchema>(env, EnvSchema);
