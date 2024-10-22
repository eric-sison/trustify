import { RefreshTokenRepository } from "../repositories/refresh-token-repository";
import { KeyStoreService } from "./keystore-service";
import { Environment } from "@trustify/config/environment";
import { refreshTokens } from "@trustify/db/schema/refresh-tokens";
import { TimeSpan } from "lucia";
import { createDate, isWithinExpirationDate } from "oslo";
import { generateRandomString } from "oslo/crypto";
import { OidcError } from "../types/oidc-error";
import { ClientService } from "./client-service";

export class RefreshTokenService {
  // Initialize the RefreshTokenRepository to interact with the database
  private readonly refreshTokenRepository = new RefreshTokenRepository();

  // Initialize the KeyStoreService that will be used in encrypting and/or decrypting the refresh token
  private readonly keyStoreService = new KeyStoreService();

  private readonly clientService = new ClientService();

  // Retrieve the the refreshTokenSecret that will be used in encrypting and decryptinh the refresh token
  private readonly appConfig = Environment.getServerConfig();

  // Generate a new refresh_token upon successful code exchange
  public async generateRefreshToken(userId: string, clientId: string, scope: string) {
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
      const refreshToken: typeof refreshTokens.$inferInsert = {
        token: encryptedToken,
        userId,
        clientId,
        expiresAt: createDate(new TimeSpan(1, "d")),
        scopes,
      };

      // Store the refresh token in the database
      const token = await this.refreshTokenRepository.createRefreshToken(refreshToken);

      // Return the generated refresh token
      // Note that the returned token is the one that is not encrypted
      return `${token.id}:${generatedRefreshToken}`;

      // Handle resulting error
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

  public async refresh(clientId: string, clientSecret: string, token: string) {
    const client = await this.clientService.verifyClientCredentials(clientId, clientSecret);

    const extractedToken = token.split(":");

    const tokenId = extractedToken[0];

    const refreshToken = extractedToken[1];

    const oldRefreshToken = await this.refreshTokenRepository.getRefreshTokenById(tokenId);

    const decryptedToken = this.keyStoreService.decryptKey(
      oldRefreshToken.token,
      this.appConfig.refreshTokenSecret,
    );

    if (refreshToken !== decryptedToken) {
      throw new OidcError({
        error: "invalid_refresh_token",
        message: "The refresh_token you provided is not valid.",
        status: 401,
      });
    }

    if (!isWithinExpirationDate(oldRefreshToken.expiresAt)) {
      throw new OidcError({
        error: "refresh_token_expired",
        message: "The refresh_token you provided is expired.",
        status: 401,
      });
    }
  }
}
