import { ID_LENGTH, USER_GENDER } from "@trustify/utils/constants";
import { z, ZodLiteral } from "zod";

export const UserAddressSchema = z.object({
  formatted: z.string().optional(),
  street_address: z.string().optional(),
  locality: z.string().optional(),
  region: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

export const UserIdParamSchema = z.object({
  userid: z.string().length(ID_LENGTH),
});

export const UpdateAuthenticationFormSchema = z.object({
  email: z.string().email({
    message: "Must be a valid email.",
  }),
  preferredUsername: z.string().min(5, {
    message: "Username must be at least 5 characters long.",
  }),
  phoneNumber: z.string().min(1, {
    message: "Please provide a mobile number.",
  }),
  emailVerified: z.boolean(),
  suspended: z.boolean(),
  phoneNumberVerified: z.boolean(),
});

export const UpdateUserDataFormSchema = z.object({
  givenName: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  middleName: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  familyName: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  nickname: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  profile: z
    .union([z.string().url({ message: "Profile page must be a valid URL." }), z.literal(""), z.undefined()])
    .transform((val) => (val === "" ? undefined : val)),
  picture: z
    .union([z.string().url({ message: "Avatar must be a valid URL." }), z.literal(""), z.undefined()])
    .transform((val) => (val === "" ? undefined : val)),
  website: z
    .union([z.string().url({ message: "Website must be a valid URL." }), z.literal(""), z.undefined()])
    .transform((val) => (val === "" ? undefined : val)),
  gender: z
    .union(
      USER_GENDER.map((type) => z.literal(type)) as [
        ZodLiteral<(typeof USER_GENDER)[number]>,
        ZodLiteral<(typeof USER_GENDER)[number]>,
      ],
    )
    .optional(),
  birthdate: z.date().optional(),
  locale: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  zoneinfo: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});
