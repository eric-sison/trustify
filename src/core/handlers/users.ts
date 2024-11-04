import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { UserService } from "../services/user-service";
import { Hono } from "hono";
import { requireAuth } from "../middlewares/require-auth";
import { zValidator } from "@hono/zod-validator";
import { UserRegistrationFormSchema } from "../schemas/auth-schema";
import { OidcError } from "../types/oidc-error";
import { z } from "zod";

export const usersHandler = new Hono<HonoAppBindings>()
  .get("/", requireAuth, async (c) => {
    const userService = new UserService();

    const users = await userService.getAllUsers();

    return c.json(users);
  })

  .get("/:userid", zValidator("param", z.object({ userid: z.string() })), requireAuth, async (c) => {
    const { userid } = c.req.valid("param");

    const userService = new UserService();

    const user = await userService.verifyUserId(userid);

    return c.json(user);
  })

  .post("/register", requireAuth, zValidator("json", UserRegistrationFormSchema), async (c) => {
    const userInfo = c.req.valid("json");

    const userService = new UserService();

    const userWithEmail = await userService.getUserByEmail(userInfo.email);

    if (userWithEmail) {
      throw new OidcError({
        error: "email_already_exists",
        message: "A user with the same email already exists.",
        status: 400,
      });
    }

    const userWithUsername = await userService.getUserByUsername(userInfo.preferredUsername);

    if (userWithUsername) {
      throw new OidcError({
        error: "username_already_exists",
        message: "A user with the same username already exists.",
        status: 400,
      });
    }

    const newUser = await userService.insertUser(userInfo);

    return c.json(newUser);
  });
