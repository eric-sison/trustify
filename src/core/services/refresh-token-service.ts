import { RefreshTokenRepository } from "@trustify/core/repositories/refresh-token-repository";
import { KeyStoreService } from "@trustify/core/services/keystore-service";
import { Environment } from "@trustify/config/environment";
import { refreshTokens } from "@trustify/db/schema/refresh-tokens";
import { createDate, isWithinExpirationDate } from "oslo";
import { generateRandomString } from "oslo/crypto";
import { OidcError } from "@trustify/core/types/oidc-error";
import { Nullable } from "@trustify/types/nullable-type";
import { SupportedClaims } from "@trustify/core/types/oidc-supports";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { GenerateTokenOptions } from "@trustify/core/types/tokens";
import { TimeSpan } from "lucia";
import { SignJWT } from "jose";

export class RefreshTokenService {
  // Initialize the RefreshTokenRepository to interact with the database
  private readonly refreshTokenRepository = new RefreshTokenRepository();

  // Initialize the KeyStoreService that will be used in encrypting and/or decrypting the refresh token
  private readonly keyStoreService = new KeyStoreService();

  // Retrieve the the refreshTokenSecret that will be used in encrypting and decryptinh the refresh token
  private readonly appConfig = Environment.getServerConfig();

  public async getClientAuthMethodFromRefreshToken(token: string) {
    // Split the refresh_token delimited by a colon
    const refreshTokenId = token.split(":")[0];

    // Get client auth method by refreshTokenId
    return await this.refreshTokenRepository.getClientAuthMethod(refreshTokenId);
  }

  public async generateJWT(options: GenerateTokenOptions) {
    try {
      return await new SignJWT({
        iss: oidcDiscovery.issuer,
        sub: options.subject,
        aud: options.audience,
        ...options.claims,
        ...options.supportedClaims,
        exp: options.expiration,
        nbf: Math.floor(Date.now() / 1000),
        iat: Math.floor(Date.now() / 1000),
      })
        .setProtectedHeader({
          typ: "JWT",
          alg: "RS256",
          kid: options.keyId,
        })
        .sign(options.signKey);
    } catch (error) {
      throw new OidcError({
        error: "invalid_id_token",
        message: "Unable to generate id_token",
        status: 400,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }

  public async createNewRefreshToken(
    userId: string,
    clientId: string,
    scope: string,
    claims: Omit<Partial<Nullable<SupportedClaims>>, "sub">,
  ) {
    const { generatedRefreshToken, refreshTokenToInsert } = this.generateRefreshToken(
      userId,
      clientId,
      scope,
      claims,
    );

    // Store the refresh token in the database
    const refreshToken = await this.refreshTokenRepository.createRefreshToken(refreshTokenToInsert);

    return `${refreshToken.id}:${generatedRefreshToken}`;
  }

  public async refresh(token: string, clientId: string) {
    try {
      // Extract the token by splitting it with the colon (:) delimeter
      // The first element in the array is the tokenId, and the second
      // element represents the actual refresh token
      const extractedToken = token.split(":");

      // Get the tokenId
      const tokenId = extractedToken[0];

      // Get the refreshToken
      const refreshToken = extractedToken[1];

      // The existing refreshToken from the database will be considered as
      // the old refresh token, because it will be replaced by the newly generated
      // token, so that it will no longer be reused to refresh new access tokens
      const oldRefreshToken = await this.refreshTokenRepository.getRefreshTokenById(tokenId);

      // Throw an error if the token with the tokenId does not exist in the database
      if (!oldRefreshToken) {
        throw new OidcError({
          error: "invalid_refresh_token",
          message: "The refresh_token you provided is not valid.",
          status: 401,
        });
      }

      // Make sure that the old refresh token was intended for the provided clientId
      // Throw an error otherwise
      if (oldRefreshToken.clientId !== clientId) {
        throw new OidcError({
          error: "invalid_refresh_token_for_client",
          message: "The refresh_token you provided is not issued to the client.",
          status: 401,
        });
      }

      // Decrypt the token from the databse
      const decryptedToken = this.keyStoreService.decryptKey(
        oldRefreshToken.token,
        this.appConfig.refreshTokenSecret,
      );

      // Check if the refresh token passed by the client is equal to the
      // decrypted refresh token from the database
      if (refreshToken !== decryptedToken) {
        throw new OidcError({
          error: "invalid_refresh_token",
          message: "The refresh_token you provided is not valid.",
          status: 401,
        });
      }

      // Throw an error if the old refresh token is expired
      if (!isWithinExpirationDate(oldRefreshToken.expiresAt)) {
        throw new OidcError({
          error: "refresh_token_expired",
          message: "The refresh_token you provided is expired.",
          status: 401,
        });
      }

      // Extract the private key and public key from the database with the status of "current"
      const { privateKeyPKCS8, publicKey } = await this.keyStoreService.extractKeysFromCurrent();

      // Generate a new refresh token. This will replace the old refresh token from the database
      const generatedToken = this.generateRefreshToken(
        oldRefreshToken.userId,
        oldRefreshToken.clientId,
        oldRefreshToken.scopes.join(" "),
        oldRefreshToken.claims,
      );

      // Remove the old token, and replace with the newly generated refresh token
      const newRefreshToken = await this.refreshTokenRepository.renewToken(
        oldRefreshToken.id,
        generatedToken.refreshTokenToInsert,
      );

      // Generate the new access token
      const accessToken = await this.generateJWT({
        audience: [oidcDiscovery.issuer],
        subject: oldRefreshToken.userId,
        supportedClaims: { ...oldRefreshToken.claims },
        keyId: publicKey.kid,
        signKey: privateKeyPKCS8,
        expiration: Math.floor(Date.now() / 1000 + 60 * 60),
      });

      // Return the new access token and new refresh token
      return {
        accessToken,
        refreshToken: `${newRefreshToken.id}:${generatedToken.generatedRefreshToken}`,
        expiration: Math.floor(Date.now() / 1000 + 60 * 60),
      };

      // Handle any error
    } catch (error) {
      throw new OidcError({
        error: "refresh_token_failed",
        message: "Failed to generate refresh token.",
        status: 500,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }

  // Generate a new refresh_token upon successful code exchange
  private generateRefreshToken(
    userId: string,
    clientId: string,
    scope: string,
    claims: Omit<Partial<Nullable<SupportedClaims>>, "sub"> | null,
  ) {
    try {
      // Split the scope string into array of strings with white-space as delimiter
      const scopes = scope.split(" ");

      // Specify the characters that will be included in the random refresh token
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

      // Generate the refresh token within the characters specified
      const generatedRefreshToken = generateRandomString(64, chars);

      // Encrypt the refresh token before storing it in the database
      const encryptedToken = this.keyStoreService.encryptKey(
        generatedRefreshToken,
        this.appConfig.refreshTokenSecret,
      );

      // Add additional data for storing refresh token in the database
      const refreshTokenToInsert: typeof refreshTokens.$inferInsert = {
        token: encryptedToken,
        userId,
        clientId,
        expiresAt: createDate(new TimeSpan(1, "d")),
        scopes,
        claims,
      };

      // Return the generated refresh token
      // Note that the returned token is the one that is not encrypted
      return { generatedRefreshToken, refreshTokenToInsert };

      // Handle resulting error
    } catch (error) {
      throw new OidcError({
        error: "refresh_token_failed",
        message: "Failed to generate new refresh token.",
        status: 500,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }
}
