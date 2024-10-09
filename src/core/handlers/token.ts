import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { TokenHeaderSchema, TokenBodySchema } from "@trustify/core/schemas/token-schema";
import { TokenService } from "@trustify/core/services/token-service";
import { zValidator } from "@hono/zod-validator";
import { redisStore } from "@trustify/config/redis";
import { KeyStoreService } from "@trustify/core/services/keystore-service";
import { KeyStoreRepository } from "@trustify/core/repositories/keystore-repository";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { UserService } from "@trustify/core/services/user-service";
import { UserRepository } from "@trustify/core/repositories/user-repository";
import { Hono } from "hono";

export const tokenHandler = new Hono<HonoAppBindings>().post(
  "/",
  zValidator("header", TokenHeaderSchema),
  zValidator("form", TokenBodySchema),
  async (c) => {
    // Validate the authorization header if it contains valid string
    const { authorization } = c.req.valid("header");

    // Validate form from request
    const tokenBody = c.req.valid("form");

    // Initialize token service
    const tokenService = new TokenService();

    // Initialize user service
    const userService = new UserService(new UserRepository());

    // Initialize keystore service
    const keyStoreService = new KeyStoreService(new KeyStoreRepository());

    // Get the payload from store using the supplied code
    const { userId, codeChallenge, nonce, scope } = await tokenService.getAuthCodePayload(
      tokenBody.code,
    );

    // Handle the token endpoint auth method, depending on the client's request
    // Return the verified client from the credentials passed in the request
    const client = await tokenService.handleClientAuthMethod(codeChallenge, tokenBody, authorization);

    // Get the user details from database using the stored userId in the payload
    const user = await userService.getUser(userId);

    // Extract the keys from keystore with status "current"
    // This ensures that the server is signning new tokens using the latest key
    const { privateKeyPKCS8, publicKey } = await keyStoreService.extractKeysFromCurrent();

    // Construct the claims object based on the requested scope stored in the payload
    const claims = tokenService.setClaimsFromScope(scope, user);

    // Generate the id_token based on the parameters acquired from previous steps
    const idToken = await tokenService.generateToken({
      audience: client?.id,
      subject: user.id,
      keyId: publicKey.kid,
      signKey: privateKeyPKCS8,
      claims: { ...claims, nonce: nonce },
      expiration: Math.floor(Date.now() / 1000 + 60 * 60), // 1 hr
    });

    // Similarly, generate the access_token based on the parameters acquired from previous steps
    const accessToken = await tokenService.generateToken({
      audience: [oidcDiscovery.userinfo_endpoint],
      subject: user.id,
      keyId: publicKey.kid,
      signKey: privateKeyPKCS8,
      claims: { scope: scope },
      expiration: Math.floor(Date.now() / 1000 + 60 * 60),
    });

    // Make sure to delete the authorization code from the redis store
    // This ensures that the same code will not be used to exchange for another set of tokens
    await redisStore.del(tokenBody.code);

    // Return the token object if all checks passed
    return c.json({
      access_token: accessToken,
      id_token: idToken,
      token_type: "Bearer",
      expires_in: Math.floor(Date.now() / 1000 + 60 * 60), // 1 hr
    });
  },
);
