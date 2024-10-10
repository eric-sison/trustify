import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { BearerAuthMiddleware, userinfoAuth } from "@trustify/core/middlewares/userinfo-auth";
import { Hono } from "hono";

export const userInfoHandler = new Hono<HonoAppBindings & BearerAuthMiddleware>()
  .post("/", userinfoAuth, async (c) => {
    const claims = c.get("claims");

    return c.json(claims);
  })
  .get("/", userinfoAuth, async (c) => {
    const claims = c.get("claims");

    return c.json(claims);
  });
