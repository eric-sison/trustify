import { ID_LENGTH } from "@trustify/utils/constants";
import { char, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { generateId } from "lucia";

export const roles = pgTable("roles", {
  id: char("role_id", { length: ID_LENGTH })
    .primaryKey()
    .$defaultFn(() => generateId(ID_LENGTH)),
  role: varchar("role").notNull(),
  description: varchar("description"),
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
