import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { UserAddressSchema } from "../schemas/user-schema";
import { z } from "zod";

export type SupportedScopes = (typeof oidcDiscovery.scopes_supported)[number];

export type SupportedResponseTypes = (typeof oidcDiscovery.response_types_supported)[number];

export type SupportedClaims = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  middle_name: string;
  nickname: string;
  preferred_username: string;
  profile: string;
  picture: string;
  website: string;
  gender: string;
  birthdate: string | undefined;
  zoneinfo: string;
  locale: string;
  updated_at: number;
  email: string;
  email_verified: boolean;
  phone_number: string;
  phone_number_verified: boolean;
  address: z.infer<typeof UserAddressSchema>;
};
