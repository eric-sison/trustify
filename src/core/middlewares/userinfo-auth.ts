import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { bearerAuth } from "hono/bearer-auth";
import { createMiddleware } from "hono/factory";
import { createLocalJWKSet, jwtVerify } from "jose";
import { KeyStoreRepository } from "@trustify/core/repositories/keystore-repository";
import { Context } from "hono";
import { UserRepository } from "../repositories/user-repository";
import { TokenService } from "../services/token-service";

export type BearerAuthMiddleware = {
  Variables: {
    claims: object;
  };
};

export const userinfoAuth = createMiddleware(async (c, next) => {
  const keyStoreRepository = new KeyStoreRepository();

  const userRepository = new UserRepository();

  const tokenService = new TokenService();

  const bearerAuthMiddleware = bearerAuth({
    verifyToken: async (token, c: Context<BearerAuthMiddleware>) => {
      const keyStore = await keyStoreRepository.getPublicKeys();

      const publicKeys = keyStore.flatMap((item) => item.publicKey);

      const jwks = createLocalJWKSet({ keys: [...publicKeys] });

      try {
        const { payload } = await jwtVerify(token, jwks, {
          issuer: oidcDiscovery.issuer,
          audience: [oidcDiscovery.userinfo_endpoint],
          algorithms: [...oidcDiscovery.id_token_signing_alg_values_supported],
          typ: "JWT",
        });

        const user = await userRepository.getUserById(payload.sub!);

        const birthdate = user.birthdate?.toISOString().split("T")[0];

        const date = new Date(user.updatedAt.getTime()); // Automatically converts to UTC

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

        // @ts-expect-error - this is not type safe
        const claims = tokenService.setClaimsFromScope(payload.scope, user);

        c.set("claims", { ...claims, sub: userInfo.sub });

        return true;
      } catch (error) {
        throw error;
      }
    },
  });

  await bearerAuthMiddleware(c, next);
});
