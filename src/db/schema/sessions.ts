import { char, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { ID_LENGTH } from "@trustify/utils/constants";
import { clients } from "./clients";

export const sessions = pgTable("sessions", {
  id: varchar("session_id").primaryKey(),
  userId: char("user_id_fk", { length: ID_LENGTH })
    .notNull()
    .references(() => users.id),
  clientId: char("client_id_fk", { length: ID_LENGTH })
    .notNull()
    .references(() => clients.id),
  userAgent: text("user_agent"),
  signedInAt: timestamp("last_signin_at", {
    withTimezone: true,
    mode: "date",
  }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
