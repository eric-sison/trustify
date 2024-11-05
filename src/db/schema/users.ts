import { UserAddressSchema } from "@trustify/core/schemas/user-schema";
import { UserMetaData } from "@trustify/types/user-metadata";
import { getRandomColor } from "@trustify/utils/get-random-color";
import { ID_LENGTH, USER_GENDER, USER_ROLES } from "@trustify/utils/constants";
import { char, pgTable, varchar, boolean, pgEnum, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { generateId } from "lucia";
import { z } from "zod";
import { roles } from "./roles";

export const userGenderEnum = pgEnum("user_gender_enum", USER_GENDER);
export const userRolesEnum = pgEnum("user_roles_enum", USER_ROLES);

export const users = pgTable("users", {
  id: char("user_id", { length: ID_LENGTH })
    .primaryKey()
    .$defaultFn(() => generateId(ID_LENGTH)),
  role: char("role_id_fk", { length: ID_LENGTH }).references(() => roles.id),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  givenName: varchar("given_name"),
  middleName: varchar("middle_name"),
  familyName: varchar("last_name"),
  nickname: varchar("nickname"),
  preferredUsername: varchar("preferred_username").unique().notNull(),
  profile: varchar("profile"),
  picture: varchar("picture"),
  website: varchar("website"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  suspended: boolean("suspended").default(false).notNull(),
  gender: userGenderEnum("gender").default("Male"),
  birthdate: date("birthdate", {
    mode: "date",
  }),
  locale: varchar("locale").default("fil-PH"),
  zoneinfo: varchar("zoneinfo").default("Asia/Manila"),
  phoneNumber: varchar("phone_number").notNull(),
  phoneNumberVerified: boolean("phone_number_verified").default(false).notNull(),
  address: jsonb("address").$type<z.infer<typeof UserAddressSchema>>(),
  metaData: jsonb("metadata")
    .$type<UserMetaData>()
    .$defaultFn(() => {
      return { defaultColor: getRandomColor() };
    })
    .notNull(),
  customData: jsonb("custom_data"),
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
