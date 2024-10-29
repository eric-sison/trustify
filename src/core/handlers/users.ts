import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { UserService } from "../services/user-service";
import { Hono } from "hono";
import { requireAuth } from "../middlewares/require-auth";
import { zValidator } from "@hono/zod-validator";
import { UserRegistrationFormSchema } from "../schemas/auth-schema";

export const usersHandler = new Hono<HonoAppBindings>()
  .get("/", requireAuth, async (c) => {
    const userService = new UserService();

    const users = await userService.getAllUsers();

    return c.json(users);
  })
  .post("/register", requireAuth, zValidator("form", UserRegistrationFormSchema), async (c) => {
    const userInfo = c.req.valid("form");

    const userService = new UserService();

    const newUser = await userService.register(userInfo);

    return c.json(newUser);
  });
