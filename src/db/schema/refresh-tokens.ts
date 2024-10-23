import { ID_LENGTH } from "@trustify/utils/constants";
import { boolean, char, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { generateId, generateIdFromEntropySize } from "lucia";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { clients } from "./clients";
import { Nullable } from "@trustify/types/nullable-type";
import { SupportedClaims } from "@trustify/core/types/oidc-supports";

export const refreshTokens = pgTable("refresh_tokens", {
  id: char("refresh_token_id", { length: ID_LENGTH })
    .primaryKey()
    .$defaultFn(() => generateId(ID_LENGTH)),
  userId: char("user_id_fk", { length: ID_LENGTH })
    .references(() => users.id)
    .notNull(),
  clientId: char("client_id_fk", { length: ID_LENGTH })
    .references(() => clients.id)
    .notNull(),
  token: varchar("token")
    .unique()
    .notNull()
    .$defaultFn(() => generateIdFromEntropySize(64)),
  scopes: varchar("scopes")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`)
    .notNull(),
  claims: jsonb("claims").$type<Omit<Partial<Nullable<SupportedClaims>>, "sub">>(),
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
});
