import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { Hono } from "hono";
import { userInfoBearerAuth } from "../middlewares/userinfo-bearer";
import { UserRepository } from "../repositories/user-repository";
import dayjs from "dayjs";

export const userInfoHandler = new Hono<HonoAppBindings>()
  .post("/", userInfoBearerAuth, async (c) => {
    const userRepository = new UserRepository();

    // @ts-expect-error
    const user = await userRepository.getUserById(c.get("subject"));

    const birthdate = user.birthdate?.toISOString().split("T")[0];

    const updatedAt = user.updated_at.getTime();

    const date = new Date(updatedAt); // Automatically converts to UTC

    const secondsSinceEpoch = Math.floor(date.getTime() / 1000);

    const userInfo = {
      sub: user.id,
      name: `${user.given_name} ${user.middle_name} ${user.family_name}`,
      given_name: user.given_name,
      family_name: user.family_name,
      middle_name: user.given_name,
      nickname: user.nickname,
      preferred_username: user.preferred_username,
      profile: user.profile,
      picture: user.picture,
      website: user.website,
      email: user.email,
      email_verified: user.email_verified,
      gender: user.gender,
      birthdate: birthdate,
      zoneinfo: user.zoneinfo,
      locale: user.locale,
      phone_number: user.phone_number,
      phone_number_verified: user.phone_number_verified,
      address: user.address,
      updated_at: secondsSinceEpoch,
    };

    return c.json(userInfo);
  })
  .get("/", userInfoBearerAuth, async (c) => {
    const userRepository = new UserRepository();

    // @ts-expect-error
    const user = await userRepository.getUserById(c.get("subject"));

    const birthdate = user.birthdate?.toISOString().split("T")[0];

    const updatedAt = user.updated_at.getTime();

    const date = new Date(updatedAt); // Automatically converts to UTC

    const secondsSinceEpoch = Math.floor(date.getTime() / 1000);

    const userInfo = {
      sub: user.id,
      name: `${user.given_name} ${user.middle_name} ${user.family_name}`,
      given_name: user.given_name,
      family_name: user.family_name,
      middle_name: user.given_name,
      nickname: user.nickname,
      preferred_username: user.preferred_username,
      profile: user.profile,
      picture: user.picture,
      website: user.website,
      email: user.email,
      email_verified: user.email_verified,
      gender: user.gender,
      birthdate: birthdate,
      zoneinfo: user.zoneinfo,
      locale: user.locale,
      phone_number: user.phone_number,
      phone_number_verified: user.phone_number_verified,
      address: user.address,
      updated_at: secondsSinceEpoch,
    };

    return c.json(userInfo);
  });
