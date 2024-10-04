import { z } from "zod";
import { ID_LENGTH } from "@trustify/utils/constants";

export const UserAddressSchema = z.object({
  streetAddress: z.string(),
  locality: z.string(),
  region: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

export const UserSchema = z.object({
  id: z.string().length(ID_LENGTH),
  role: z.enum(["admin", "client"]),
  email: z.string().email(),
  password: z.string(),
  givenName: z.string(),
  middleName: z.string(),
  familyName: z.string(),
  nickName: z.string().optional(),
  preferredUsername: z.string().optional(),
  profile: z.string().url().optional(),
  picture: z.string().url().optional(),
  website: z.string().url().optional(),
  emailVerified: z.boolean(),
  suspended: z.boolean(),
  gender: z.enum(["Male", "Female"]),
  birthDate: z.string().date().optional(),
  zoneinfo: z.string().optional(),
  phoneNumber: z.string().optional(),
  phoneNumberVerified: z.boolean(),
  address: UserAddressSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
