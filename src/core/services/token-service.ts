import {
  AuthCodePayloadSchema,
  TokenBodySchema,
  RequestClaimSchema,
  ClaimsSchema,
} from "@trustify/core/schemas/token-schema";
import { ClientService } from "@trustify/core/services/client-service";
import { UserClaims } from "@trustify/core/types/tokens";
import { SupportedClaims, SupportedScopes } from "@trustify/core/types/oidc-supports";
import { Nullable } from "@trustify/types/nullable-type";
import { OidcError } from "@trustify/core/types/oidc-error";
import { redisStore } from "@trustify/config/redis";
import { z } from "zod";

export class TokenService {
  // private readonly refreshTokenService = new RefreshTokenService();

  private readonly clientService = new ClientService();

  public async handleClientSecretBasic(
    authorizationHeader: string | undefined,
    challenge?: z.infer<typeof AuthCodePayloadSchema>["code_challenge"],
    verifier?: z.infer<typeof TokenBodySchema>["code_verifier"],
  ) {
    // Check if authorization header is not undefined and if its value has 'Basic'
    if (authorizationHeader && authorizationHeader.split(" ")[0] === "Basic") {
      // If so, get the encoded client credentials from the header
      const encodedCredentials = authorizationHeader.split(" ")[1];

      // Extract the credentials by decoding it
      const { clientId, secret } = this.extractCredentials(encodedCredentials);

      // Verify if the client credentials are valid
      const client = await this.clientService.verifyClientCredentials(clientId, secret);

      await this.handlePKCE(challenge, verifier);

      // Otherwise, return the client
      return client;
    }

    throw new OidcError({
      error: "unsupported_client_auth_method",
      message: "Make sure authorization header is valid.",
      status: 400,
    });
  }

  public async handleClientSecretPost(clientId: string | undefined, secret: string | undefined) {
    if (!clientId || !secret) {
      throw new OidcError({
        error: "unsupported_client_auth_method",
        message: "Make sure client_id and secret is provided in the request body.",
        status: 400,
      });
    }

    // Verify client credentials if valid
    const client = await this.clientService.verifyClientCredentials(clientId!, secret);

    // Return the client
    return client;
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

  public getClaims(
    claimsFor: "id_token" | "userinfo",
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
      if (requestedClaims.id_token && claimsFor === "id_token") {
        essentialClaims = this.setEssentialClaims(requestedClaims.id_token, user);
      }

      // Check if request has essential claims set for userinfo
      if (requestedClaims.userinfo && claimsFor === "userinfo") {
        essentialClaims = this.setEssentialClaims(requestedClaims.userinfo, user);
      }
    }

    return {
      ...defaultClaims,
      ...essentialClaims,
    } as Omit<Partial<Nullable<SupportedClaims>>, "sub">;
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
        error: "code_verifier_error",
        message: "Code verifier might be malformed.",
        status: 400,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }

  private async handlePKCE(
    codeChallenge: z.infer<typeof AuthCodePayloadSchema>["code_challenge"],
    codeVerifier: z.infer<typeof TokenBodySchema>["code_verifier"],
  ) {
    // Only run this function if code_verifier is provided in the request parameter
    if (codeVerifier && codeChallenge) {
      // Hash the code verifier to see if it matches with the stored code_challenge
      const hashedCode = await this.hashCodeVerifier(codeVerifier);

      // Check if the hashed code_verifier matches with the code_challenge, and throw an error if it doesn't
      if (hashedCode !== codeChallenge) {
        throw new OidcError({
          error: "pkce_error",
          message: "Code challenge and verifier don't match",
          description: "Code challenge and verifier don't match",
          status: 400,
        });
      }
    }
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

    if (claims.email?.essential) {
      essentialClaims.email = user.email;
    }

    if (claims.phone_number?.essential) {
      essentialClaims.phone_number = user.phoneNumber;
    }

    if (claims.given_name?.essential) {
      essentialClaims.given_name = user.givenName;
    }

    if (claims.middle_name?.essential) {
      essentialClaims.middle_name = user.middleName;
    }

    if (claims.family_name?.essential) {
      essentialClaims.family_name = user.familyName;
    }

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

    if (claims.address?.essential) {
      essentialClaims.address = user.address;
    }

    return essentialClaims;
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
