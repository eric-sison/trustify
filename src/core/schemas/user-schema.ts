import { ID_LENGTH, USER_GENDER, USER_ROLES } from "@trustify/utils/constants";
import { z, ZodLiteral } from "zod";

export const UserAddressSchema = z.object({
  formatted: z.string().optional(),
  street_address: z.string().optional(),
  locality: z.string().optional(),
  region: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string(),
});

export const UserUpdateDataSchema = z.object({
  role: z
    .union(
      USER_ROLES.map((type) => z.literal(type)) as [
        ZodLiteral<(typeof USER_ROLES)[number]>,
        ZodLiteral<(typeof USER_ROLES)[number]>,
      ],
    )
    .optional(),
  givenName: z.string(),
  middleName: z.string(),
  familyName: z.string(),
  nickname: z.string().optional(),
  profile: z.string().url().optional(),
  picture: z.string().url().optional(),
  website: z.string().url().optional(),
  gender: z
    .union(
      USER_GENDER.map((type) => z.literal(type)) as [
        ZodLiteral<(typeof USER_GENDER)[number]>,
        ZodLiteral<(typeof USER_GENDER)[number]>,
      ],
    )
    .optional(),
  birthdate: z.date().optional(),
  locale: z.string().optional(),
  zoneinfo: z.string().optional(),
});
