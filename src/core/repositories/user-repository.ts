import { db } from "@trustify/config/postgres";
import { users } from "@trustify/db/schema/users";
import { OidcError } from "@trustify/core/types/oidc-error";
import { sql, eq } from "drizzle-orm";

export class UserRepository {
  public async getUserById(userId: string) {
    try {
      const ps = db
        .select({
          id: users.id,
          gender: users.gender,
          email: users.email,
          given_name: users.givenName,
          middle_name: users.middleName,
          family_name: users.familyName,
          nickname: users.nickname,
          preferred_username: users.preferredUsername,
          birthdate: users.birthdate,
          profile: users.profile,
          picture: users.picture,
          website: users.website,
          email_verified: users.emailVerified,
          locale: users.locale,
          zoneinfo: users.zoneinfo,
          phone_number: users.phoneNumber,
          phone_number_verified: users.phoneNumberVerified,
          address: users.address,
          updated_at: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, sql.placeholder("userId")))
        .prepare("get_user_by_id");

      const result = await ps.execute({ userId });

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

  public async getUserByEmail(email: string) {
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
