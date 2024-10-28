import { EnvSchema, HostEnvSchema } from "@trustify/types/env-schema";
import { validateEnv } from "@trustify/utils/validate-env";

export class Environment {
  public static getServerConfig() {
    const appEnv = {
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
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    };

    return validateEnv<typeof EnvSchema>(appEnv, EnvSchema);
  }

  public static getPublicConfig() {
    const hostEnv = {
      adminHost: process.env.NEXT_PUBLIC_ADMIN_HOST!,
    };

    return validateEnv(hostEnv, HostEnvSchema);
  }
}
