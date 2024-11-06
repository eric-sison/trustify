import { DEFAULT_COLORS, USER_GENDER } from "@trustify/utils/constants";
import { UserAddressSchema } from "../schemas/user-schema";
import { z } from "zod";

export type UserData = {
  id: string;
  email: string;
  givenName: string | null;
  middleName: string | null;
  familyName: string | null;
  nickname: string | null;
  preferredUsername: string;
  profile: string | null;
  picture: string | null;
  website: string | null;
  emailVerified: boolean;
  suspended: boolean;
  gender: (typeof USER_GENDER)[number] | null;
  birthdate: Date | null;
  locale: string | null;
  zoneinfo: string | null;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  address: z.infer<typeof UserAddressSchema> | null;
  metadata: { defaultColor: (typeof DEFAULT_COLORS)[number] } | null;
  createdAt: string;
  updatedAt: string;
};

export type UserSummary = {
  id: string;
  picture: string | null;
  givenName: string | null;
  middleName: string | null;
  familyName: string | null;
  name: string | null;
  preferredUsername: string;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  email: string;
  emailVerified: boolean;
  suspended: boolean;
  metadata: { defaultColor: (typeof DEFAULT_COLORS)[number] };
};

export type UserIdentity = {
  id: string;
  name: string | null;
  givenName: string | null;
  middleName: string | null;
  familyName: string | null;
  prefferedUsername: string | null;
  email: string | null;
};
