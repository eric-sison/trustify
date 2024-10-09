import { ID_LENGTH, KEY_STATUS } from "@trustify/utils/constants";
import { char, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { type JWK } from "jose";
import { generateId } from "lucia";

export const keyStatus = pgEnum("key_status_enum", KEY_STATUS);

export const keyStore = pgTable("keystore", {
  id: char("keystore_id", { length: ID_LENGTH })
    .primaryKey()
    .$defaultFn(() => generateId(ID_LENGTH)),
  encryptionKey: text("encryption_key").notNull(),
  privateKey: text("private_key").notNull(),
  publicKey: jsonb("public_keys").$type<JWK>().notNull(),
  status: keyStatus("status").default("current").notNull(),
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
