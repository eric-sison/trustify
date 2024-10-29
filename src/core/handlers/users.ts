import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { UserService } from "../services/user-service";
import { Hono } from "hono";
import { requireAuth } from "../middlewares/require-auth";

export const usersHandler = new Hono<HonoAppBindings>().get("/", requireAuth, async (c) => {
  const userService = new UserService();

  const users = await userService.getAllUsers();

  return c.json(users);
});
