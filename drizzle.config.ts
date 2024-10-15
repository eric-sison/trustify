import { Environment } from "@trustify/config/environment";
import { defineConfig } from "drizzle-kit";

const serverConfig = Environment.getServerConfig();

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dialect: "postgresql",
  verbose: true,
  dbCredentials: {
    host: serverConfig.dbHost,
    port: serverConfig.dbPort,
    user: serverConfig.dbUser,
    password: serverConfig.dbPassword,
    database: serverConfig.dbName,
  },
});
