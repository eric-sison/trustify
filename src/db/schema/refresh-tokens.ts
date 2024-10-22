import { ID_LENGTH } from "@trustify/utils/constants";
import { boolean, char, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { generateId, generateIdFromEntropySize } from "lucia";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { clients } from "./clients";

export const refreshTokens = pgTable("refresh_tokens", {
  id: char("refresh_token_id", { length: ID_LENGTH })
    .primaryKey()
    .$defaultFn(() => generateId(ID_LENGTH)),
  userId: char("user_id_fk", { length: ID_LENGTH }).references(() => users.id),
  clientId: char("client_id_fk", { length: ID_LENGTH }).references(() => clients.id),
  tokenFamily: char("token_family", { length: ID_LENGTH })
    .notNull()
    .$defaultFn(() => generateId(ID_LENGTH)),
  token: varchar("token")
    .unique()
    .notNull()
    .$defaultFn(() => generateIdFromEntropySize(64)),
  scopes: varchar("scopes")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`)
    .notNull(),
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
