import { zValidator } from "@hono/zod-validator";
import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { Hono } from "hono";
import { LoginFormSchema, LoginRequestSchema } from "../schemas/auth-schema";

export const authenticationHandler = new Hono<HonoAppBindings>().post(
  "/login",
  zValidator("query", LoginRequestSchema),
  zValidator("form", LoginFormSchema),
  async (c) => {
    return c.json({});
  },
);
