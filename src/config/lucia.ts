import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { users } from "@trustify/db/schema/users";
import { Lucia, TimeSpan } from "lucia";
import { db } from "./postgres";
import { sessions } from "@trustify/db/schema/sessions";

// @ts-expect-error the sessions table has custom columns
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "d"),
  sessionCookie: {
    name: "sid",
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getSessionAttributes: (attributes) => {
    return {
      userAgent: attributes.userAgent,
      signedInAt: attributes.signedInAt,
      clientId: attributes.clientId,
    };
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      givenName: attributes.givenName,
      middleName: attributes.middleName,
      familyName: attributes.familyName,
      picture: attributes.picture,
      role: attributes.role,
    };
  },
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
  "userAgent" | "signedInAt" | "clientId"
>;

export type DatabaseUserAttributes = Pick<
  typeof users.$inferSelect,
  "email" | "givenName" | "middleName" | "familyName" | "picture" | "role"
>;
