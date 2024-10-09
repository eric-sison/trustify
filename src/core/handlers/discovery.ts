import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { KeyStoreRepository } from "@trustify/core/repositories/keystore-repository";
import { Hono } from "hono";

export const discoveryHandler = new Hono()
  .get("/openid-configuration", async (c) => {
    return c.json(oidcDiscovery);
  })
  .get("/jwks.json", async (c) => {
    const keyStoreRepository = new KeyStoreRepository();

    const keys = await keyStoreRepository.getPublicKeys();

    const jwks = {
      keys: keys.map(({ publicKey }) => ({
        kty: publicKey.kty,
        kid: publicKey.kid,
        use: publicKey.use,
        alg: publicKey.alg,
        n: publicKey.n,
        e: publicKey.e,
      })),
    };

    return c.json(jwks);
  });
