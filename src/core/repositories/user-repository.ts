import { db } from "@trustify/config/postgres";
import { users } from "@trustify/db/schema/users";
import { OidcError } from "@trustify/types/oidc-error";
import { sql, eq } from "drizzle-orm";

export class UserRepository {
  async getUserByEmail(email: string) {
    try {
      const ps = db
        .select()
        .from(users)
        .where(eq(users.email, sql.placeholder("email")))
        .prepare("get_user_by_email");

      const result = await ps.execute({ email });

      return result[0];
    } catch (error) {
      throw new OidcError({
        error: "failed_query",
        message: "Failed to execute query.",
        status: 500,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }
}
