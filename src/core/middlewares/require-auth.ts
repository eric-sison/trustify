import { lucia } from "@trustify/config/lucia";
import { cache } from "@trustify/utils/cache";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const requireAuth = createMiddleware(async (c, next) => {
  const sessionId =
    /**
     * Get session_id from browser cookie for client-side requests
     */
    getCookie(c, lucia.sessionCookieName) ??
    /**
     * Get session_id from cookie headers for server-side requests
     */
    c.req.header("Cookie")?.match(new RegExp(`(?:^|;\\s*)${lucia.sessionCookieName}=([^;]*)`))?.[1] ??
    /**
     * If session_id is not found in cookie header nor the browser, return null value
     */
    null;

  if (!sessionId) {
    // set context variable user to null
    c.set("user", null);

    // set context variable session to null
    c.set("session", null);

    // Bypass OIDC Error if route path is login
    if (c.req.routePath === "/api/v1/oidc/login" && c.req.method === "POST") {
      c.set("requireAuth", true);
      return await next();
    }

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
    key: `${lucia.sessionCookieName}_${sessionId}`,
    ttl: 3600 * 24,
    debug: false,
    onCacheMiss: async () => {
      try {
        return await lucia.validateSession(sessionId);
      } catch (error) {
        throw new HTTPException(401, {
          message: "unauthorized_action",
          cause: error,
        });
      }
    },
  });

  if (data.session && data.session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(data.session.id).serialize(), {
      append: true,
    });

    c.set("requireAuth", false);
  }

  if (!data.session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });

    c.set("requireAuth", true);
  }

  c.set("user", data.user);

  c.set("session", data.session);

  return next();
});
