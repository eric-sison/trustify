import { Hono } from "hono";
import { requireAuth } from "../middlewares/require-auth";

export const testHander = new Hono().get("/", requireAuth, async (c) => {
  return c.json({ hello: "world!" });
  ///throw new Error("Something went wrong!");
});
