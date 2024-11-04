import { DEFAULT_COLORS, USER_GENDER, USER_ROLES } from "@trustify/utils/constants";
import { UserAddressSchema } from "../schemas/user-schema";
import { z } from "zod";

export type UserData = {
  id: string;
  role: (typeof USER_ROLES)[number];
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
