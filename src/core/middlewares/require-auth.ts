import { lucia } from "@trustify/config/lucia";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { cache } from "@trustify/core/libs/cache";

export const requireAuth = createMiddleware(async (c, next) => {
  // get session_id from cookie
  const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    // set context variable user to null
    c.set("user", null);

    // set context variable session to null
    c.set("session", null);

    // return unauthorized error
    return c.json(
      {
        error: "unauthorized_action",
        message: "You need to be authenticated in order to perform this action!",
        status: 401,
      },
      401,
    );
  }

  // cache the session
  const data = await cache({
    key: `sid_${sessionId}`,
    ttl: 3600 * 24,
    debug: false,
    onCacheMiss: async () => await lucia.validateSession(sessionId),
  });

  //const data = await lucia.validateSession(sessionId);

  if (data.session && data.session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(data.session.id).serialize(), {
      append: true,
    });
  }

  if (!data.session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }

  c.set("user", data.user);

  c.set("session", data.session);

  return next();
});
