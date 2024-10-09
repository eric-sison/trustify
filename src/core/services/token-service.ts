import { redisStore } from "@trustify/config/redis";
import { TokenHeaderSchema, TokenRequestSchema } from "../schemas/token-schema";
import { OidcError } from "@trustify/core/types/oidc-error";
import { ClientRepository } from "@trustify/core/repositories/client-repository";
import { AuthCodePayload } from "@trustify/core/types/auth-code-payload";
import { verifyHash } from "@trustify/utils/hash-fns";
import { z } from "zod";
import { UserRepository } from "../repositories/user-repository";

export class TokenService {
  constructor(
    private readonly tokenHeader: z.infer<typeof TokenHeaderSchema>,
    private readonly tokenRequest: z.infer<typeof TokenRequestSchema>,
  ) {}

  public async handleTokenAuthMethodFlow(payload: AuthCodePayload) {
    // Extract the authorization header from the request
    const authHeader = this.tokenHeader.authorization;

    // Check if auth method is client_auth_basic
    if (authHeader && authHeader.split(" ")[0] === "Basic") {
      // If so, handle the client authentication
      const client = await this.handleClientAuthBasic(authHeader);

      // Handle code_challenge and code_verifier matching
      await this.handlePKCE(payload);

      // Return the client
      return client;
    }

    // Check if auth method is client_auth_post
    if (this.tokenRequest.client_secret) {
      // Verify client credentials if valid
      const client = await this.verifyClient(this.tokenRequest.client_id!, this.tokenRequest.client_secret);

      // Return the client
      return client;
    }
  }

  private async handlePKCE(payload: AuthCodePayload) {
    // Check if the request to /token has code_verifier
    if (this.tokenRequest.code_verifier) {
      // Hash the code verifier to see if it matches with the stored code_challenge
      const hashedCode = await this.hashCodeVerifier(this.tokenRequest.code_verifier);

      // Check if the hashed code_verifier matches with the code_challenge, and throw an error if it doesn't
      if (hashedCode !== payload.codeChallenge) {
        throw new OidcError({
          error: "invalid_code",
          message: "Code challenge and verifier don't match",
          status: 400,
        });
      }
    }
  }

  private async handleClientAuthBasic(authHeader: string | undefined) {
    // Check if authorization header is not undefined and if its value has 'Basic'
    if (authHeader && authHeader.split(" ")[0] === "Basic") {
      // If so, get the encoded client credentials from the header
      const encoded = authHeader.split(" ")[1];

      // Extract the credentials by decoding it
      const { clientId, secret } = this.extractCredentials(encoded);

      // Verify if the client credentials are valid
      const client = await this.verifyClient(clientId, secret);

      // Otherwise, return the client
      return client;
    }
  }

  private async verifyClient(clientId: string, secret: string) {
    // Initialize clientRepository to interact with the database
    const clientRepository = new ClientRepository();

    // Get the client by ID
    const client = await clientRepository.getClientById(clientId);

    // If there is no client matching the ID, throw an error
    if (!client) {
      throw new OidcError({
        error: "invalid_client",
        message: "Invalid client credentials!",
        status: 401,
      });
    }

    // Otherwise, check if client secret matches with the hashed secret stored in the database
    const isSecretValid = await verifyHash(client.secret, secret);

    // If not, throw an error
    if (!isSecretValid) {
      throw new OidcError({
        error: "invalid_client",
        message: "Invalid client credentials!",
        status: 401,
      });
    }

    // Otherwise, return the client
    return client;
  }

  private extractCredentials(base64: string) {
    // Decode the base64 client credentials and split by token ':'
    const decodedString = this.decodeBase64(base64).split(":");

    // Assign first element in the array as the clientId
    const clientId = decodedString[0];

    // Assign the second element in the array as the secret
    const secret = decodedString[1];

    // Return the extracted credentials
    return { clientId, secret };
  }

  public async getAuthCodePayload() {
    // Get the stored request from the authorization code issued by the server
    const requestDetails = await redisStore.get(this.tokenRequest.code);

    // Throw an error if the supplied code does not exist in the store
    if (!requestDetails) {
      throw new OidcError({
        error: "invalid_code",
        message: "Authorization code is invalid!",
        status: 400,
      });
    }

    try {
      // Otherwise, parse and return the payload
      return JSON.parse(requestDetails) as AuthCodePayload;

      // Handle JSON.parse error
    } catch (error) {
      throw new OidcError({
        error: "json_parse_error",
        message: "Failed to parse the JSON payload",
        status: 500,

        // @ts-expect-error error is of unkown type
        stack: error.stack,
      });
    }
  }

  public async getUser(userId: string) {
    // Initialize userRepository to interact with the database
    const userRepository = new UserRepository();

    // Get the user by ID
    const user = await userRepository.getUserById(userId);

    // Throw an error if the user is not found
    if (!user) {
      throw new OidcError({
        error: "invalid_user",
        message: "User not found!",
        status: 404,
      });
    }

    // Return user
    return user;
  }

  public async hashCodeVerifier(codeVerifier: string) {
    try {
      // Convert the code verifier to a byte array
      const encoder = new TextEncoder();

      const data = encoder.encode(codeVerifier);

      // Hash the data using SHA-256
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);

      // Convert the hash to a byte array
      const hashArray = Array.from(new Uint8Array(hashBuffer));

      // Convert the byte array to a Base64 string, and then make it URL-safe
      const base64Hash = btoa(String.fromCharCode(...hashArray))
        .replace(/\+/g, "-") // Replace '+' with '-'
        .replace(/\//g, "_") // Replace '/' with '_'
        .replace(/=+$/, ""); // Remove trailing '=' characters

      return base64Hash;
    } catch (error) {
      throw new OidcError({
        error: "invalid_code",
        message: "Code verifier might be malformed.",
        status: 400,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }

  private decodeBase64(base64String: string) {
    try {
      // Return the decoded base64 string
      return Buffer.from(base64String, "base64").toString("utf-8");

      // Handle error when decoding base64 string
    } catch (error) {
      throw new OidcError({
        error: "invalid_code",
        message: "Client credentials might be malformed.",
        status: 400,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }
}
