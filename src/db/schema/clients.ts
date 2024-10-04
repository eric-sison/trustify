import { ID_LENGTH } from "@trustify/utils/constants";
import { sql } from "drizzle-orm";
import { pgTable, char, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { generateId } from "lucia";

export const clients = pgTable("clients", {
  id: char("client_id", { length: ID_LENGTH }).primaryKey().default(generateId(ID_LENGTH)),
  name: varchar("name", { length: 100 }).unique().notNull(),
  description: text("description"),
  logo: varchar("logo"),
  clientUrl: varchar("client_url").notNull(),
  secret: varchar("secret").unique().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  tokenEndpointAuthMethod: varchar("token_endpoint_auth_method")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`)
    .notNull(),
  grantTypes: varchar("grant_types")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`)
    .notNull(),
  responseTypes: varchar("response_types")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`)
    .notNull(),
  redirectUris: varchar("redirect_uris")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`)
    .notNull(),
  scopes: varchar("scopes")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`)
    .notNull(),
  termsOfUseUrl: text("terms_of_use_url"),
  privacyPolicyUrl: text("privacy_policy_url"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});
