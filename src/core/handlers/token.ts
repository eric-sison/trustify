import { TokenHeaderSchema, TokenBodySchema } from "@trustify/core/schemas/token-schema";
import { ClientService } from "@trustify/core/services/client-service";
import { KeyStoreService } from "@trustify/core/services/keystore-service";
import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { TokenService } from "@trustify/core/services/token-service";
import { OidcError } from "@trustify/core/types/oidc-error";
import { UserService } from "@trustify/core/services/user-service";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { redisStore } from "@trustify/config/redis";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export const tokenHandler = new Hono<HonoAppBindings>().post(
  "/",
  zValidator("header", TokenHeaderSchema),
  zValidator("form", TokenBodySchema),
  async (c) => {
    // Validate the authorization header if it contains valid string
    const { authorization } = c.req.valid("header");

    // Validate form from request
    const { code, grant_type, client_id, client_secret, code_verifier, refresh_token } = c.req.valid("form");

    // Initialize token service
    const tokenService = new TokenService();

    // Initialize client service
    const clientService = new ClientService();

    // Initialize user service
    const userService = new UserService();

    // Get the payload from store using the supplied code
    const payload = await tokenService.getAuthCodePayload(code);

    // Handle grant_type=authorization_code
    if (grant_type === "authorization_code") {
      // Get the token_endpoint_auth_method from the database
      const clientAuthMethod = await clientService.getClientAuthMethod(client_id);

      // Handle the token endpoint auth method, depending on the client's request
      // Return the verified client from the credentials passed in the request
      const client =
        clientAuthMethod === "client_secret_basic"
          ? await tokenService.handleClientSecretBasic(authorization, payload.code_challenge, code_verifier)
          : await tokenService.handleClientSecretPost(client_id, client_secret);

      // Get the user details from database using the stored userId in the payload
      const user = await userService.getUserById(payload.userId);

      // Initialize keystore service
      const keyStoreService = new KeyStoreService();

      // Extract the keys from keystore with status "current"
      // This ensures that the server is signning new tokens using the latest key
      const { privateKeyPKCS8, publicKey } = await keyStoreService.extractKeysFromCurrent();

      // TODO: Test this out
      const idTokenClaims = oidcDiscovery.claims_supported
        ? tokenService.getClaims("id_token", payload.claims, payload.scope, user)
        : {};

      // Generate the id_token based on the parameters acquired from previous steps
      const idToken = await tokenService.generateToken({
        audience: client?.id,
        subject: user.id,
        keyId: publicKey.kid,
        signKey: privateKeyPKCS8,
        expiration: Math.floor(Date.now() / 1000 + 60 * 60), // 1 hr
        claims: {
          nonce: payload.nonce,
          auth_time: Math.floor(Date.now() / 1000),

          // Get claims for id_token
          ...idTokenClaims,
        },
      });

      // Similarly, generate the access_token based on the parameters acquired from previous steps
      const accessToken = await tokenService.generateToken({
        audience: [oidcDiscovery.userinfo_endpoint],
        subject: user.id,
        keyId: publicKey.kid,
        signKey: privateKeyPKCS8,
        expiration: Math.floor(Date.now() / 1000 + 60 * 60),
      });

      // Make sure to delete the authorization code from the redis store
      // This ensures that the same code will not be used to exchange for another set of tokens
      await redisStore.del(code);

      // Return the token object if all checks passed
      return c.json({
        access_token: accessToken,
        id_token: idToken,
        token_type: "Bearer",
        expires_in: Math.floor(Date.now() / 1000 + 60 * 60), // 1 hr
      });
    }

    // TODO: implement refresh token
    else if (grant_type === "refresh_token") {
      // Make sure client_id and client_secret is not undefined
      if (!client_id || !client_secret) {
        throw new OidcError({
          error: "invalid_client",
          message: "Client not found!",
          status: 401,
        });
      }

      // Make sure there is a refresh_token in the request body
      if (!refresh_token) {
        throw new OidcError({
          error: "missing_refresh_token",
          message: "Please make sure you're passing the correct refresh token",
          status: 400,
        });
      }

      const client = await clientService.verifyClientCredentials(client_id, client_secret);

      // TODO: implement this function
      // // Get refresh_token from database
      // const refreshToken = await tokenService.getRefreshToken();

      // // If no refresh_token, expired, or revoked, throw error
      // if (!refreshToken || refreshToken.expired || refreshToken.revoked) {
      //   return res.status(400).json({ error: "invalid_grant" });
      // }

      console.log({ client });

      return c.json({
        access_token: "<access_token>",
        refresh_token: "<refresh_token>",
        token_type: "Bearer",
        expires_in: 3600,
      });
    }

    throw new OidcError({
      error: "unsupported_grant_type",
      message: "The grant_type you provided is not supported by Trustify.",
      status: 400,
    });
  },
);
