import { LoginRequestSchema } from "@trustify/types/auth-schema";
import { z } from "zod";

export class AuthorizationService {
  constructor(private readonly loginRequest: z.infer<typeof LoginRequestSchema>) {}
}
