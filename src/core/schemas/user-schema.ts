import { z } from "zod";

export const UserAddressSchema = z.object({
  streetAddress: z.string(),
  locality: z.string(),
  region: z.string(),
  postalCode: z.string(),
  country: z.string(),
});
