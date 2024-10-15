import { drizzle } from "drizzle-orm/postgres-js";
import { Environment } from "@trustify/config/environment";
import postgres from "postgres";

const serverConfig = Environment.getServerConfig();

const client = postgres({
  host: serverConfig.dbHost,
  port: Number(serverConfig.dbPort),
  username: serverConfig.dbUser,
  password: serverConfig.dbPassword,
  database: serverConfig.dbName,
  max: 20,
  idle_timeout: 20, // close connections that have been idle for 20 secs
  max_lifetime: 60 * 60, // close connections that have existed for more than 1 hour
});

export const db = drizzle(client);
