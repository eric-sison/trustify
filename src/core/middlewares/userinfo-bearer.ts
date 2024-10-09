import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { bearerAuth } from "hono/bearer-auth";
import { createMiddleware } from "hono/factory";
import { createLocalJWKSet, jwtVerify } from "jose";
import { KeyStoreRepository } from "../repositories/keystore-repository";

export const userInfoBearerAuth = createMiddleware(async (c, next) => {
  const bearerAuthMiddleware = bearerAuth({
    verifyToken: async (token, c) => {
      const keyStoreRepository = new KeyStoreRepository();

      const keyStore = await keyStoreRepository.getPublicKeys();

      const publicKeys = keyStore.flatMap((item) => item.publicKey);

      const jwks = createLocalJWKSet({ keys: [...publicKeys] });

      try {
        const { payload } = await jwtVerify(token, jwks, {
          issuer: oidcDiscovery.issuer,
          audience: [oidcDiscovery.userinfo_endpoint],
        });

        c.set("subject", payload.sub);

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  });

  await bearerAuthMiddleware(c, next);
});
