import { UserAddress } from "@trustify/types/user-schema";
import { ID_LENGTH } from "@trustify/utils/constants";
import { char, pgTable, varchar, boolean, pgEnum, timestamp, jsonb } from "drizzle-orm/pg-core";
import { generateId } from "lucia";
import { z } from "zod";

export const userGenderEnum = pgEnum("user_gender_enum", ["Male", "Female"]);
export const userRolesEnum = pgEnum("user_roles_enum", ["admin", "client"]);

export const users = pgTable("users", {
  id: char("user_id", { length: 16 }).primaryKey().default(generateId(ID_LENGTH)),
  role: userRolesEnum("user_role").default("client").notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  givenName: varchar("given_name").notNull(),
  middleName: varchar("middle_name").notNull(),
  familyName: varchar("last_name").notNull(),
  nickName: varchar("nick_name"),
  preferredUsername: varchar("preferred_username"),
  profile: varchar("profile"),
  picture: varchar("picture"),
  website: varchar("website"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  suspended: boolean("is_suspended").default(false).notNull(),
  gender: userGenderEnum("gender").default("Male"),
  birthdate: timestamp("birth_date", {
    mode: "date",
  }),
  zoneinfo: varchar("zone_info"),
  phoneNumber: varchar("phone_number"),
  phoneNumberVerified: boolean("phone_number_verified").default(false).notNull(),
  address: jsonb("address").$type<z.infer<typeof UserAddress>>(),
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
