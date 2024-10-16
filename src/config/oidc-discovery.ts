import { Environment } from "./environment";

const adminHost = Environment.getPublicConfig().adminHost;

export const oidcDiscovery = {
  issuer: `${adminHost}/api/v1`,
  authorization_endpoint: `${adminHost}/api/v1/authorization`,
  token_endpoint: `${adminHost}/api/v1/token`,
  jwks_uri: `${adminHost}/api/v1/.well-known/jwks.json`,
  userinfo_endpoint: `${adminHost}/api/v1/userinfo`,
  response_types_supported: ["code", "code id_token", "code token", "code id_token token"] as const,
  claims_parameter_supported: true,
  claims_supported: [
    "sub",
    "name",
    "given_name",
    "family_name",
    "middle_name",
    "nickname",
    "preferred_username",
    "profile",
    "picture",
    "website",
    "email",
    "email_verified",
    "gender",
    "birthdate",
    "zoneinfo",
    "locale",
    "phone_number",
    "phone_number_verified",
    "address",
    "updated_at",
  ] as const,
  scopes_supported: [
    "openid",
    "profile",
    "email",
    "phone",
    "address",

    // TODO: request for refresh_token is to be implemented
    // "offline_access"
  ] as const,
  subject_types_supported: ["public"] as const,
  id_token_signing_alg_values_supported: [
    "RS256",

    // TODO: other signing algorithms to be implemented
    // "HS256",
    // "ES256"
  ] as const,
  grant_types_supported: ["authorization_code", "refresh_token"] as const,
  token_endpoint_auth_methods_supported: [
    "client_secret_basic",
    "client_secret_post",

    // TODO: implement this
    // "private_key_jwt"
  ] as const,
};
