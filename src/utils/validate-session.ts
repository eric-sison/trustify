"server-only";

import { lucia } from "@trustify/config/lucia";
import { cookies } from "next/headers";
import { cache } from "react";

export const validateSession = cache(async () => {
  const cookieStore = await cookies();

  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) return null;

  const { user, session } = await lucia.validateSession(sessionId);

  if (user && session) {
    try {
      if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }

      if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }

      return { user, session };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  return null;
});
