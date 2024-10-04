import { z, ZodSchema } from "zod";

export function validateEnv<T extends ZodSchema>(env: z.infer<T>, schema: T): z.infer<T> {
  // Validate the `env` object against the provided `schema`.
  const parsed = schema.safeParse(env);

  // If validation fails, log the error details.
  if (!parsed.success) {
    // TODO: add production logger
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);

    // Throws an error with a detailed message and attaches the validation error as the cause.
    throw new Error("Invalid environment variables", { cause: parsed.error });
  }

  // Return the parsed and validated environment variables.
  return parsed.data;
}
