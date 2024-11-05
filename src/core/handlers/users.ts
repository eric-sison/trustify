import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { UserService } from "../services/user-service";
import { Hono } from "hono";
import { requireAuth } from "../middlewares/require-auth";
import { zValidator } from "@hono/zod-validator";
import { UserRegistrationFormSchema } from "../schemas/auth-schema";
import {
  UserIdParamSchema,
  UpdateAuthenticationFormSchema,
  UpdateUserDataFormSchema,
  UserAddressSchema,
} from "../schemas/user-schema";

export const usersHandler = new Hono<HonoAppBindings>()
  .get("/", requireAuth, async (c) => {
    const userService = new UserService();

    const users = await userService.getAllUsers();

    return c.json(users);
  })

  .get("/:userid", zValidator("param", UserIdParamSchema), requireAuth, async (c) => {
    const { userid } = c.req.valid("param");

    const userService = new UserService();

    const user = await userService.verifyUserId(userid);

    return c.json(user);
  })

  .patch(
    "authentication-details/:userid",
    zValidator("param", UserIdParamSchema),
    zValidator("json", UpdateAuthenticationFormSchema),
    async (c) => {
      const { userid } = c.req.valid("param");

      const userData = c.req.valid("json");

      const userService = new UserService();

      const updatedUser = await userService.updateUser(userid, userData);

      return c.json(updatedUser);
    },
  )

  .patch(
    "user-data/:userid",
    zValidator("param", UserIdParamSchema),
    zValidator("json", UpdateUserDataFormSchema),
    async (c) => {
      const { userid } = c.req.valid("param");

      const userData = c.req.valid("json");

      const userService = new UserService();

      const updatedUser = await userService.updateUser(userid, {
        ...userData,
        familyName: userData.familyName === undefined ? null : userData.familyName,
        givenName: userData.givenName === undefined ? null : userData.givenName,
        middleName: userData.middleName === undefined ? null : userData.middleName,
        nickname: userData.nickname === undefined ? null : userData.nickname,
        picture: userData.picture === undefined ? null : userData.picture,
        profile: userData.profile === undefined ? null : userData.profile,
        website: userData.website === undefined ? null : userData.website,
        zoneinfo: userData.zoneinfo === undefined ? null : userData.zoneinfo,
        locale: userData.locale === undefined ? null : userData.locale,
      });

      return c.json(updatedUser);
    },
  )

  .patch(
    "/user-address/:userid",
    zValidator("param", UserIdParamSchema),
    zValidator("json", UserAddressSchema),
    async (c) => {
      const { userid } = c.req.valid("param");

      const userAddress = c.req.valid("json");

      const userService = new UserService();

      const updatedUserAddress = await userService.updateUser(userid, { address: userAddress });

      return c.json(updatedUserAddress);
    },
  )

  .post("/register", requireAuth, zValidator("json", UserRegistrationFormSchema), async (c) => {
    const userInfo = c.req.valid("json");

    const userService = new UserService();

    await userService.verifyIfEmailOrUsernameExists(userInfo.email, userInfo.preferredUsername);

    const newUser = await userService.insertUser(userInfo);

    return c.json(newUser);
  });
