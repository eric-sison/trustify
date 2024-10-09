import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { TokenHeaderSchema, TokenRequestSchema } from "@trustify/core/schemas/token-schema";
import { TokenService } from "@trustify/core/services/token-service";
import { zValidator } from "@hono/zod-validator";
import { redisStore } from "@trustify/config/redis";
import { Hono } from "hono";
import { KeyStoreService } from "../services/keystore-service";
import { KeyStoreRepository } from "../repositories/keystore-repository";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";

export const tokenHandler = new Hono<HonoAppBindings>().post(
  "/",
  zValidator("header", TokenHeaderSchema),
  zValidator("form", TokenRequestSchema),
  async (c) => {
    const tokenHeader = c.req.valid("header");

    const tokenRequest = c.req.valid("form");

    const tokenService = new TokenService(tokenHeader, tokenRequest);

    const keyStoreService = new KeyStoreService(new KeyStoreRepository());

    const payload = await tokenService.getAuthCodePayload();

    const client = await tokenService.handleTokenAuthMethodFlow(payload);

    const user = await tokenService.getUser(payload.userId);

    const { privateKeyPKCS8, publicKey } = await keyStoreService.extractKeysFromCurrent();

    const idToken = await keyStoreService.generateToken({
      audience: client?.id,
      subject: user.id,
      keyId: publicKey.kid,
      privateKey: privateKeyPKCS8,
      customClaims: { nonce: payload.nonce },
      expiration: Math.floor(Date.now() / 1000 + 60 * 60), // 1 hr
    });

    const accessToken = await keyStoreService.generateToken({
      audience: [oidcDiscovery.userinfo_endpoint],
      subject: user.id,
      keyId: publicKey.kid,
      privateKey: privateKeyPKCS8,
      expiration: Math.floor(Date.now() / 1000 + 60 * 60),
    });

    await redisStore.del(tokenRequest.code);

    return c.json({
      access_token: accessToken,
      id_token: idToken,
      token_type: "Bearer",
      expires_in: Math.floor(Date.now() / 1000 + 60 * 60), // 1 hr
    });
  },
);
