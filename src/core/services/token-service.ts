import {
  AuthCodePayloadSchema,
  TokenHeaderSchema,
  TokenBodySchema,
  RequestClaimSchema,
  ClaimsSchema,
} from "@trustify/core/schemas/token-schema";
import { GenerateTokenOptions, UserClaims } from "@trustify/core/types/tokens";
import { SupportedClaims, SupportedScopes } from "@trustify/core/types/oidc-supports";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { Nullable } from "@trustify/utils/nullable-type";
import { OidcError } from "@trustify/core/types/oidc-error";
import { ClientRepository } from "@trustify/core/repositories/client-repository";
import { verifyHash } from "@trustify/utils/hash-fns";
import { redisStore } from "@trustify/config/redis";
import { SignJWT } from "jose";
import { z } from "zod";

export class TokenService {
  constructor() {}

  public async handleClientAuthMethod(
    codeChallenge: z.infer<typeof AuthCodePayloadSchema>["codeChallenge"],
    tokenRequest: z.infer<typeof TokenBodySchema>,
    authorizationHeader: z.infer<typeof TokenHeaderSchema>["authorization"],
  ) {
    // Extract the authorization header from the request
    //const authHeader = this.tokenHeader.authorization;

    // Check if auth method is client_auth_basic
    if (authorizationHeader && authorizationHeader.split(" ")[0] === "Basic") {
      // If so, handle the client authentication
      const client = await this.handleClientAuthBasic(authorizationHeader);

      // Handle code_challenge and code_verifier matching
      await this.handlePKCE(codeChallenge, tokenRequest.code_verifier);

      // Return the client
      return client;
    }

    // Check if auth method is client_auth_post
    if (tokenRequest.client_secret) {
      // Verify client credentials if valid
      const client = await this.verifyClient(tokenRequest.client_id!, tokenRequest.client_secret);

      // Return the client
      return client;
    }
  }

  private async handlePKCE(
    codeChallenge: z.infer<typeof AuthCodePayloadSchema>["codeChallenge"],
    codeVerifier: z.infer<typeof TokenBodySchema>["code_verifier"],
  ) {
    // Check if the request to /token has code_verifier
    if (codeVerifier) {
      // Hash the code verifier to see if it matches with the stored code_challenge
      const hashedCode = await this.hashCodeVerifier(codeVerifier);

      // Check if the hashed code_verifier matches with the code_challenge, and throw an error if it doesn't
      if (hashedCode !== codeChallenge) {
        throw new OidcError({
          error: "invalid_code",
          message: "Code challenge and verifier don't match",
          description: "Code challenge and verifier don't match",
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

  public async getAuthCodePayload(code: string) {
    // Get the stored request from the authorization code issued by the server
    const requestDetails = await redisStore.get(code);

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
      return JSON.parse(requestDetails) as z.infer<typeof AuthCodePayloadSchema>;

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

  private async hashCodeVerifier(codeVerifier: string) {
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

  /**
   * Returns an object containing default claims based on the
   * provided scopes. The object includes properties such as `sub`, `email`,
   * `phone_number`, `address`, `given_name`, `middle_name`, and `family_name`, with values populated
   * from the corresponding properties of the `user` object based on the specified scopes.
   */
  private setDefaultClaims(scopes: Array<SupportedScopes>, user: UserClaims) {
    // Initialize the value of the default claim. Initially, it is an empty object.
    const defaultClaims: Partial<Nullable<SupportedClaims>> = {};

    // Loop through all the possible scopes (based on the `scopes_supported`)
    scopes.forEach((scope) => {
      switch (scope) {
        // If requested scope contains `openid`, include the sub claim as the user's ID
        case "openid": {
          defaultClaims.sub = user.id;
          break;
        }

        // If the requested scope contains `email`, include the email claim as the user's email
        case "email": {
          defaultClaims.email = user.email;
          break;
        }

        // If the scope contains `phone`, include the phone claim as the user's phone number
        case "phone": {
          defaultClaims.phone_number = user.phoneNumber;
          break;
        }

        // If the scope contains `address`, include the address claim as the user's address
        case "address": {
          defaultClaims.address = user.address;
          break;
        }

        // If the scope contains `profile`, incude the default profile claims as user's given_name,
        // middle_name, and family_name, respectively
        case "profile": {
          defaultClaims.given_name = user.givenName;
          defaultClaims.middle_name = user.middleName;
          defaultClaims.family_name = user.familyName;

          break;
        }
      }
    });

    return defaultClaims;
  }

  /**
   * Returns an object containing essential claims based on the provided `claims` and `user` data.
   * The object includes properties such as `email_verified`, `phone_number_verified`, `name`, `nickname`,
   * `preferred_username`, `profile`,`picture`, `website`, `locale`, `zoneinfo`, `updated_at`, and `birthdate`,
   * with their corresponding values. These claims are defined by the `RequestClaimSchema` type. The
   * function checks each claim to see if it is marked as essential and then populates the
   * `essentialClaims` object accordingly based
   */
  private setEssentialClaims(claims: z.infer<typeof RequestClaimSchema>, user: UserClaims) {
    // Initialize essentialClaims to be an empty object
    const essentialClaims: Partial<Nullable<SupportedClaims>> = {};

    // Include gender if claim is marked as essential
    if (claims.gender?.essential) {
      essentialClaims.gender = user.gender;
    }

    // Include email_verified if claim is marked as essential
    if (claims.email_verified?.essential) {
      essentialClaims.email_verified = user.emailVerified;
    }

    // Include phone_number_verified if claim is marked as essential
    if (claims.phone_number_verified?.essential) {
      essentialClaims.phone_number_verified = user.phoneNumberVerified;
    }

    // Include name if claim is marked as essential
    if (claims.name?.essential) {
      essentialClaims.name = `${user.givenName} ${user.middleName} ${user.familyName}`;
    }

    // Include nickname if claim is marked as essential
    if (claims.nickname?.essential) {
      essentialClaims.nickname = user.nickname;
    }

    // Include preferred_username if claim is marked as essential
    if (claims.preferred_username?.essential) {
      essentialClaims.preferred_username = user.preferredUsername;
    }

    // Include profile if claim is marked as essential
    if (claims.profile?.essential) {
      essentialClaims.profile = user.profile;
    }

    // Include picture if claim is marked as essential
    if (claims.picture?.essential) {
      essentialClaims.picture = user.picture;
    }

    // Include website if claim is marked as essential
    if (claims.website?.essential) {
      essentialClaims.website = user.website;
    }

    // Include locale if claim is marked as essential
    if (claims.locale?.essential) {
      essentialClaims.locale = user.locale;
    }

    // Include zoneinfo if claim is marked as essential
    if (claims.zoneinfo?.essential) {
      essentialClaims.zoneinfo = user.zoneinfo;
    }

    // Include updated_at if claim is marked as essential
    if (claims.updated_at?.essential) {
      essentialClaims.updated_at = Math.floor(user.updatedAt.getTime() / 1000);
    }

    // Include birthdate if claim is marked as essential
    if (claims.birthdate?.essential) {
      essentialClaims.birthdate = user.birthdate?.toISOString().split("T")[0];
    }

    return essentialClaims;
  }

  public getClaims(
    destination: "id_token" | "userinfo",
    claims: string | undefined,
    scope: string,
    user: UserClaims,
  ) {
    // Split the scope string to extract the requested scopes
    const requestedScopes = scope.split(" ") as Array<SupportedScopes>;

    // Initialize the default claims based on the requested scopes
    const defaultClaims = this.setDefaultClaims(requestedScopes, user);

    // Initialize essential claims as an empty object
    let essentialClaims: Partial<Nullable<SupportedClaims>> = {};

    // Check if claims is present in the request url
    if (claims) {
      // If so, parse the string to extract the requested claims
      const requestedClaims = JSON.parse(claims) as z.infer<typeof ClaimsSchema>;

      // Check if request has essential claims set for id_token
      if (requestedClaims.id_token && destination === "id_token") {
        essentialClaims = this.setEssentialClaims(requestedClaims.id_token, user);
      }

      // Check if request has essential claims set for userinfo
      if (requestedClaims.userinfo && destination === "userinfo") {
        essentialClaims = this.setEssentialClaims(requestedClaims.userinfo, user);
      }
    }

    return {
      ...defaultClaims,
      ...essentialClaims,
    } as Omit<Partial<Nullable<SupportedClaims>>, "sub">;
  }

  public async generateToken(options: GenerateTokenOptions) {
    try {
      return await new SignJWT({
        iss: oidcDiscovery.issuer,
        sub: options.subject,
        aud: options.audience,
        ...options?.claims,
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
