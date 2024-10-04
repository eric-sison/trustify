import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres({
  host: "",
  port: 5432,
  username: "",
  password: "",
  database: "",
  max: 20,
  idle_timeout: 20, // close connection the has been idle for 20 secs
  max_lifetime: 60 * 60, // close connections that have existed for more than 1 hour
});

export const db = drizzle(client);
