import { ID_LENGTH } from "@trustify/utils/constants";
import { boolean, char, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { generateId } from "lucia";
import { sessions } from "./sessions";

export const refreshTokens = pgTable("refresh_tokens", {
  id: char("refresh_token_id", { length: ID_LENGTH })
    .primaryKey()
    .$defaultFn(() => generateId(ID_LENGTH)),
  sessionId: varchar("session_id_fk", { length: 255 })
    .notNull()
    .references(() => sessions.id),
  parentTokenId: char("parent_token_id", { length: ID_LENGTH }),
  token: varchar("token").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  issuedAt: timestamp("issued_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  invalidatedAt: timestamp("invalidated_at", {
    withTimezone: true,
    mode: "date",
  }),
});
