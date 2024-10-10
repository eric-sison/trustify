import { type KeyLike } from "jose";
import { z } from "zod";
import { UserAddressSchema } from "@trustify/core/schemas/user-schema";
import { Nullable } from "@trustify/utils/nullable-type";
import { users } from "@trustify/db/schema/users";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";

export type OidcScopes = (typeof oidcDiscovery.scopes_supported)[number];

export type OidcResponseType = (typeof oidcDiscovery.response_types_supported)[number];

export type GenerateTokenOptions = {
  keyId: string | undefined;
  signKey: KeyLike;
  subject: string | undefined;
  audience: string | string[] | undefined;
  claims?:
    | (Omit<Partial<Nullable<SupportedClaims>>, "sub"> & {
        auth_time?: number;
        nonce?: string;
        acr?: string;
        amr?: string[];
      })
    | Omit<
        Partial<Record<(typeof oidcDiscovery.claims_supported)[number], Record<"essential", boolean>>>,
        "sub"
      >;
  expiration: number | undefined;
};

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

export type UserClaims = Omit<
  typeof users.$inferSelect,
  "createdAt" | "role" | "password" | "suspended"
>;
