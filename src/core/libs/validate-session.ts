"server-only";

import { lucia } from "@trustify/config/lucia";
import { cookies } from "next/headers";
import { cache } from "react";

export const validateSession = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) return null;

  const { user, session } = await lucia.validateSession(sessionId);

  if (user && session) {
    try {
      if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }

      if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }

      return { user, session };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  return null;
});
