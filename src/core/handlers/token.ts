import { TokenHeaderSchema, TokenBodySchema } from "@trustify/core/schemas/token-schema";
import { RefreshTokenService } from "@trustify/core/services/refresh-token-service";
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
    const { code, grant_type, client_id, client_secret, code_verifier, refresh_token, redirect_uri } =
      c.req.valid("form");

    // Initialize token service
    const tokenService = new TokenService();

    const refreshTokenService = new RefreshTokenService();

    // Initialize client service
    const clientService = new ClientService();

    // Initialize user service
    const userService = new UserService();

    // Handle grant_type=authorization_code
    if (grant_type === "authorization_code") {
      // Make sure that code and redirect_uri is provided
      if (!code || !redirect_uri) {
        throw new OidcError({
          error: "invalid_authorization_code",
          message: "Your authorization code is either missing or invalid",
          status: 400,
        });
      }

      // Get the payload from store using the supplied code
      const payload = await tokenService.getAuthCodePayload(code);

      // Get the token_endpoint_auth_method from the database
      const clientAuthMethod = await clientService.getClientAuthMethod(payload.client_id);

      // Handle the token endpoint auth method, depending on the client's request
      // Return the verified client from the credentials passed in the request
      const client =
        clientAuthMethod === "client_secret_basic"
          ? await tokenService.handleClientSecretBasic(authorization, payload.code_challenge, code_verifier)
          : await tokenService.handleClientSecretPost(client_id, client_secret);

      // Get the user details from database using the stored userId in the payload
      const user = await userService.verifyUserId(payload.userId);

      // Initialize keystore service
      const keyStoreService = new KeyStoreService();

      // Extract the keys from keystore with status "current"
      // This ensures that the server is signning new tokens using the latest key
      const { privateKeyPKCS8, publicKey } = await keyStoreService.extractKeysFromCurrent();

      const idTokenClaims = oidcDiscovery.claims_supported
        ? tokenService.getClaims("id_token", payload.claims, payload.scope, user)
        : {};

      const userinfoClaims = oidcDiscovery.claims_supported
        ? tokenService.getClaims("userinfo", payload.claims, payload.scope, user)
        : {};

      // Make sure to delete the authorization code from the redis store
      // This ensures that the same code will not be used to exchange for another set of tokens
      await redisStore.del(code);

      // Generate the id_token based on the parameters acquired from previous steps
      const idToken = await refreshTokenService.generateJWT({
        audience: client.id,
        subject: user.id,
        keyId: publicKey.kid,
        signKey: privateKeyPKCS8,
        expiration: Math.floor(Date.now() / 1000 + 60 * 60), // 1 hr
        supportedClaims: {
          nonce: payload.nonce,
          auth_time: Math.floor(Date.now() / 1000),
          ...idTokenClaims, // Get claims for id_token
        },
      });

      // Similarly, generate the access_token based on the parameters acquired from previous steps
      const accessToken = await refreshTokenService.generateJWT({
        audience: [oidcDiscovery.userinfo_endpoint],
        subject: user.id,
        supportedClaims: { ...userinfoClaims },
        keyId: publicKey.kid,
        signKey: privateKeyPKCS8,
        expiration: Math.floor(Date.now() / 1000 + 60 * 60),
      });

      // Return with refresh_token if offline_access is provided in the scopes
      if (payload.scope.split(" ").includes("offline_access")) {
        return c.json({
          refresh_token: await refreshTokenService.createNewRefreshToken(
            user.id,
            client.id,
            payload.scope,
            userinfoClaims,
          ),
          access_token: accessToken,
          id_token: idToken,
          token_type: "Bearer",
          expires_in: Math.floor(Date.now() / 1000 + 60 * 60), // 1 hr
        });
      }

      // Return the token object if all checks passed
      return c.json({
        access_token: accessToken,
        id_token: idToken,
        token_type: "Bearer",
        expires_in: Math.floor(Date.now() / 1000 + 60 * 60), // 1 hr
      });
    }

    // Check if grant_type is refresh_token
    else if (grant_type === "refresh_token") {
      // Make sure there is a refresh_token in the request body
      if (!refresh_token) {
        throw new OidcError({
          error: "missing_refresh_token",
          message: "Please make sure you're passing the correct refresh token",
          status: 400,
        });
      }

      // Get client auth method from refresh_token
      const clientAuth = await refreshTokenService.getClientAuthMethodFromRefreshToken(refresh_token);

      // Verify client depending on the client's token_endpoint_auth_method
      const client =
        clientAuth.method === "client_secret_basic"
          ? await tokenService.handleClientSecretBasic(authorization)
          : await tokenService.handleClientSecretPost(client_id, client_secret);

      // Rotate refresh_tokens
      const { accessToken, refreshToken, expiration } = await refreshTokenService.refresh(
        refresh_token,
        client.id,
      );

      // Return the tokens
      return c.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: expiration,
      });
    }

    throw new OidcError({
      error: "unsupported_grant_type",
      message: "The grant_type you provided is not supported by Trustify.",
      status: 400,
    });
  },
);
