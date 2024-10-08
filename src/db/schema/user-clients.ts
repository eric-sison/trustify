// import { char, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";
// import { users } from "./users";
// import { clients } from "./clients";
// import { ID_LENGTH } from "@trustify/utils/constants";
// import { sessions } from "./sessions";

// export const userClients = pgTable(
//   "user_clients",
//   {
//     sessionId: varchar("session_id_fk").references(() => sessions.id),
//     userId: char("user_id_fk", { length: ID_LENGTH }).references(() => users.id),
//     clientId: char("client_id_fk", { length: ID_LENGTH }).references(() => clients.id),
//     userAgent: text("user_agent"),
//     lastSignInAt: timestamp("last_signin_at", {
//       withTimezone: true,
//       mode: "date",
//     }),
//     createdAt: timestamp("created_at", {
//       withTimezone: true,
//       mode: "date",
//     })
//       .defaultNow()
//       .notNull(),
//     updatedAt: timestamp("updated_at", {
//       withTimezone: true,
//       mode: "date",
//     })
//       .defaultNow()
//       .notNull(),
//   },
//   (table) => {
//     return {
//       pk: primaryKey({ name: "user_clients_pk", columns: [table.userId, table.clientId] }),
//     };
//   },
// );
