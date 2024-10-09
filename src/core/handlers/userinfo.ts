import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { Hono } from "hono";
import { userInfoBearerAuth } from "../middlewares/userinfo-bearer";
import { UserRepository } from "../repositories/user-repository";
import { TokenService } from "../services/token-service";

export const userInfoHandler = new Hono<HonoAppBindings>()
  .post("/", userInfoBearerAuth, async (c) => {
    const userRepository = new UserRepository();

    // @ts-expect-error - this is not type safe
    const user = await userRepository.getUserById(c.get("subject"));

    const birthdate = user.birthdate?.toISOString().split("T")[0];

    const updatedAt = user.updatedAt.getTime();

    const date = new Date(updatedAt); // Automatically converts to UTC

    const secondsSinceEpoch = Math.floor(date.getTime() / 1000);

    const userInfo = {
      sub: user.id,
      name: `${user.givenName} ${user.middleName} ${user.familyName}`,
      given_name: user.givenName,
      family_name: user.familyName,
      middle_name: user.givenName,
      nickname: user.nickname,
      preferred_username: user.preferredUsername,
      profile: user.profile,
      picture: user.picture,
      website: user.website,
      email: user.email,
      email_verified: user.emailVerified,
      gender: user.gender,
      birthdate: birthdate,
      zoneinfo: user.zoneinfo,
      locale: user.locale,
      phone_number: user.phoneNumber,
      phone_number_verified: user.phoneNumberVerified,
      address: user.address,
      updated_at: secondsSinceEpoch,
    };

    return c.json(userInfo);
  })
  .get("/", userInfoBearerAuth, async (c) => {
    const userRepository = new UserRepository();

    const tokenService = new TokenService();

    // @ts-expect-error - this is not type safe
    const user = await userRepository.getUserById(c.get("subject"));

    const birthdate = user.birthdate?.toISOString().split("T")[0];

    const updatedAt = user.updatedAt.getTime();

    const date = new Date(updatedAt); // Automatically converts to UTC

    const secondsSinceEpoch = Math.floor(date.getTime() / 1000);

    const userInfo = {
      sub: user.id,
      name: `${user.givenName} ${user.middleName} ${user.familyName}`,
      given_name: user.givenName,
      family_name: user.familyName,
      middle_name: user.givenName,
      nickname: user.nickname,
      preferred_username: user.preferredUsername,
      profile: user.profile,
      picture: user.picture,
      website: user.website,
      email: user.email,
      email_verified: user.emailVerified,
      gender: user.gender,
      birthdate: birthdate,
      zoneinfo: user.zoneinfo,
      locale: user.locale,
      phone_number: user.phoneNumber,
      phone_number_verified: user.phoneNumberVerified,
      address: user.address,
      updated_at: secondsSinceEpoch,
    };

    const claims = tokenService.setClaimsFromScope("openid phone", user);

    return c.json({ ...claims, sub: userInfo.sub });
  });
