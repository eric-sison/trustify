import { char, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { ID_LENGTH } from "@trustify/utils/constants";
import { users } from "./users";
import { clients } from "./clients";
import { type userAgent } from "next/server";

export const sessions = pgTable("sessions", {
  //? This field is handled by lucia
  id: varchar("session_id", { length: 255 }).primaryKey(),
  userId: char("user_id_fk", { length: ID_LENGTH })
    .notNull()
    .references(() => users.id),
  clientId: char("client_id_fk", { length: ID_LENGTH })
    .notNull()
    .references(() => clients.id),
  userAgent: jsonb("user_agent").$type<ReturnType<typeof userAgent>>(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  signedInAt: timestamp("last_signin_at", {
    withTimezone: true,
    mode: "date",
  }),
});
