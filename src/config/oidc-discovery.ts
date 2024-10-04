import { appConfig } from "@trustify/config/environment";

export const oidcDiscovery = {
  issuer: `${appConfig.adminHost}`,
  authorization_endpoint: `${appConfig.adminHost}/api/v1/authorization`,
  token_endpoint: `${appConfig.adminHost}/api/v1/token`,
  userinfo_endpoint: `${appConfig.adminHost}/api/v1/userinfo`,
  jwks_uri: `${appConfig.adminHost}/api/v1/:client_id/.well-known/jwks.json`,
  response_types_supported: [
    "code",

    // TODO: other response types to be implemented
    // "code id_token",
    // "code token",
    // "code id_token token",
    // "id_token token"
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
  grant_types_supported: ["authorization_code"] as const,
};
