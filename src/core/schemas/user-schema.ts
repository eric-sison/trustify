import { z } from "zod";

export const UserAddressSchema = z.object({
  formatted: z.string().optional(),
  street_address: z.string().optional(),
  locality: z.string().optional(),
  region: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string(),
});
