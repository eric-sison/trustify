import { UserAddressSchema } from "@trustify/core/schemas/user-schema";
import { ID_LENGTH, USER_GENDER, USER_ROLES } from "@trustify/utils/constants";
import { char, pgTable, varchar, boolean, pgEnum, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { generateId } from "lucia";
import { z } from "zod";

export const userGenderEnum = pgEnum("user_gender_enum", USER_GENDER);
export const userRolesEnum = pgEnum("user_roles_enum", USER_ROLES);

export const users = pgTable("users", {
  id: char("user_id", { length: ID_LENGTH }).primaryKey().default(generateId(ID_LENGTH)),
  role: userRolesEnum("role").default("client").notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  givenName: varchar("given_name").notNull(),
  middleName: varchar("middle_name").notNull(),
  familyName: varchar("last_name").notNull(),
  nickname: varchar("nickname"),
  preferredUsername: varchar("preferred_username"),
  profile: varchar("profile"),
  picture: varchar("picture"),
  website: varchar("website"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  suspended: boolean("suspended").default(false).notNull(),
  gender: userGenderEnum("gender").default("Male"),
  birthdate: date("birthdate", {
    mode: "date",
  }),
  locale: varchar("locale"),
  zoneinfo: varchar("zoneinfo"),
  phoneNumber: varchar("phone_number"),
  phoneNumberVerified: boolean("phone_number_verified").default(false).notNull(),
  address: jsonb("address").$type<z.infer<typeof UserAddressSchema>>(),
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
