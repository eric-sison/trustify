import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { users } from "@trustify/db/schema/users";
import { Lucia, TimeSpan } from "lucia";
import { db } from "./postgres";
import { sessions } from "@trustify/db/schema/sessions";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "d"),
  sessionCookie: {
    name: "sid",
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getSessionAttributes: (attributes) => attributes,
  getUserAttributes: (attributes) => attributes,
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

export type DatabaseSessionAttributes = Pick<
  typeof sessions.$inferSelect,
  "userAgent" | "signedInAt" | "clientId" | "consentGrant"
>;

export type DatabaseUserAttributes = Pick<
  typeof users.$inferSelect,
  "email" | "givenName" | "middleName" | "familyName" | "picture" | "role"
>;
