import { appConfig } from "@trustify/config/environment";

export const oidcDiscovery = {
  issuer: `${appConfig.adminHost}`,
  authorization_endpoint: `${appConfig.adminHost}/api/v1/authorization`,
  token_endpoint: `${appConfig.adminHost}/api/v1/token`,
  userinfo_endpoint: `${appConfig.adminHost}/api/v1/userinfo`,
  jwks_uri: `${appConfig.adminHost}/api/v1/:client_id/.well-known/jwks.json`,
  response_types_supported: [
    "code",
    // "code id_token",
    // "code token",
    // "code id_token token",
    // "id_token token"
  ],
  scopes_supported: ["openid", "profile", "email", "contact"],
  subject_types_supported: ["public", "pairwise"],
  id_token_signing_alg_values_supported: ["RS256"],
  grant_types_supported: ["authorization_code"],
};
