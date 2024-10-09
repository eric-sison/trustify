import { char, jsonb, pgTable, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { ID_LENGTH } from "@trustify/utils/constants";
import { clients } from "./clients";
import { type userAgent } from "next/server";
import { generateId } from "lucia";

export const sessions = pgTable("sessions", {
  id: char("session_id")
    .primaryKey()
    .$defaultFn(() => generateId(ID_LENGTH)),
  userId: char("user_id_fk", { length: ID_LENGTH })
    .notNull()
    .references(() => users.id),
  clientId: char("client_id_fk", { length: ID_LENGTH })
    .notNull()
    .references(() => clients.id),
  userAgent: jsonb("user_agent").$type<ReturnType<typeof userAgent>>(),
  signedInAt: timestamp("last_signin_at", {
    withTimezone: true,
    mode: "date",
  }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
