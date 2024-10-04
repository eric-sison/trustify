import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { appConfig } from "./environment";

const client = postgres({
  host: appConfig.dbHost,
  port: Number(appConfig.dbPort),
  username: appConfig.dbUser,
  password: appConfig.dbPassword,
  database: appConfig.dbName,
  max: 20,
  idle_timeout: 20, // close connections that have been idle for 20 secs
  max_lifetime: 60 * 60, // close connections that have existed for more than 1 hour
});

export const db = drizzle(client);
