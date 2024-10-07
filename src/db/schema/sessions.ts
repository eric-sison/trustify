import { char, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { ID_LENGTH } from "@trustify/utils/constants";

export const sessions = pgTable("sessions", {
  id: varchar("session_id").primaryKey(),
  userId: char("user_id_fk", { length: ID_LENGTH })
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
