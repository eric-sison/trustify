import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { TokenHeaderSchema, TokenRequestSchema } from "@trustify/core/schemas/token-schema";
import { TokenService } from "@trustify/core/services/token-service";
import { zValidator } from "@hono/zod-validator";
import { redisStore } from "@trustify/config/redis";
import { Hono } from "hono";
import { KeyStoreService } from "../services/keystore-service";
import { KeyStoreRepository } from "../repositories/keystore-repository";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { UserService } from "../services/user-service";
import { UserRepository } from "../repositories/user-repository";

export const tokenHandler = new Hono<HonoAppBindings>().post(
  "/",
  zValidator("header", TokenHeaderSchema),
  zValidator("form", TokenRequestSchema),
  async (c) => {
    const { authorization } = c.req.valid("header");

    const tokenRequest = c.req.valid("form");

    const tokenService = new TokenService();

    const userService = new UserService(new UserRepository());

    const keyStoreService = new KeyStoreService(new KeyStoreRepository());

    const payload = await tokenService.getAuthCodePayload(tokenRequest.code);

    const client = await tokenService.handleTokenAuthMethodFlow(payload, tokenRequest, authorization);

    const user = await userService.getUser(payload.userId);

    const { privateKeyPKCS8, publicKey } = await keyStoreService.extractKeysFromCurrent();

    const claims = tokenService.setClaimsFromScope(payload.scope, user);

    const idToken = await tokenService.generateToken({
      audience: client?.id,
      subject: user.id,
      keyId: publicKey.kid,
      privateKey: privateKeyPKCS8,
      claims: { ...claims, nonce: payload.nonce },
      expiration: Math.floor(Date.now() / 1000 + 60 * 60), // 1 hr
    });

    const accessToken = await tokenService.generateToken({
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
