import { type KeyLike } from "jose";
import { z } from "zod";
import { UserAddressSchema } from "../schemas/user-schema";

export type GenerateTokenOptions = {
  keyId: string | undefined;
  privateKey: KeyLike;
  subject: string;
  audience: string | string[] | undefined;
  customClaims?: object;
  expiration: number | undefined;
};

export type RequestedClaims = {
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
