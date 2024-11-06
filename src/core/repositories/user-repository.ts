import { db } from "@trustify/config/postgres";
import { users } from "@trustify/db/schema/users";
import { OidcError } from "@trustify/core/types/oidc-error";
import { sql, eq } from "drizzle-orm";
import { z } from "zod";
import { UserRegistrationFormSchema } from "../schemas/auth-schema";
import { PostgresError } from "postgres";

export class UserRepository {
  public async createUser(userInfo: z.infer<typeof UserRegistrationFormSchema>) {
    try {
      const ps = db
        .insert(users)
        .values({
          email: userInfo.email,
          password: userInfo.password,
          preferredUsername: userInfo.preferredUsername,
          phoneNumber: userInfo.phoneNumber,
          emailVerified: Boolean(userInfo.emailVerified),
        })
        .returning({
          id: users.id,
          role: users.role,
          email: users.email,
          givenName: users.givenName,
          middleName: users.middleName,
          familyName: users.familyName,
          nickname: users.nickname,
          preferredUsername: users.preferredUsername,
          profile: users.profile,
          picture: users.picture,
          website: users.website,
          emailVerified: users.emailVerified,
          suspended: users.suspended,
          gender: users.gender,
          birthdate: users.birthdate,
          locale: users.locale,
          zoneinfo: users.zoneinfo,
          phoneNumber: users.phoneNumber,
          phoneNumberVerified: users.phoneNumberVerified,
          address: users.address,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .prepare("create_user");

      const result = await ps.execute();

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

  public async getAllUsers() {
    try {
      const ps = db
        .select({
          id: users.id,
          picture: users.picture,
          email: users.email,
          name: users.name,
          fullName: users.name,
          givenName: users.givenName,
          middleName: users.middleName,
          familyName: users.familyName,
          preferredUsername: users.preferredUsername,
          emailVerified: users.emailVerified,
          suspended: users.suspended,
          phoneNumber: users.phoneNumber,
          phoneNumberVerified: users.phoneNumberVerified,
          metadata: users.metaData,
        })
        .from(users)
        .prepare("get_all_users");

      const result = await ps.execute();

      return result;
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

  public async getUserById(userId: string) {
    try {
      const ps = db
        .select({
          id: users.id,
          role: users.role,
          suspended: users.suspended,
          gender: users.gender,
          email: users.email,
          givenName: users.givenName,
          middleName: users.middleName,
          familyName: users.familyName,
          nickname: users.nickname,
          preferredUsername: users.preferredUsername,
          birthdate: users.birthdate,
          profile: users.profile,
          picture: users.picture,
          website: users.website,
          emailVerified: users.emailVerified,
          locale: users.locale,
          zoneinfo: users.zoneinfo,
          phoneNumber: users.phoneNumber,
          phoneNumberVerified: users.phoneNumberVerified,
          address: users.address,
          metadata: users.metaData,
          updatedAt: users.updatedAt,
          createdAt: users.createdAt,
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

  public async getUserByPreferredUsername(preferredUsername: string) {
    try {
      const ps = db
        .select()
        .from(users)
        .where(eq(users.preferredUsername, sql.placeholder("preferredUsername")))
        .prepare("get_user_by_preferred_username");

      const result = await ps.execute({ preferredUsername });

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

  async getUserIdentity(userId: string) {
    try {
      const ps = db
        .select({
          id: users.id,
          name: users.name,
          givenName: users.givenName,
          middleName: users.middleName,
          familyName: users.familyName,
          prefferedUsername: users.preferredUsername,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId))
        .prepare("get_user_identity_by_id");

      const result = await ps.execute();

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

  async updateUser(userId: string, data: Partial<typeof users.$inferInsert>) {
    try {
      const fullName = [data.givenName, data.middleName, data.familyName].filter((name) => name).join(" ");

      const ps = db
        .update(users)
        .set({ ...data, name: fullName, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          role: users.role,
          email: users.email,
          name: users.name,
          givenName: users.givenName,
          middleName: users.middleName,
          familyName: users.familyName,
          nickname: users.nickname,
          preferredUsername: users.preferredUsername,
          profile: users.profile,
          picture: users.picture,
          website: users.website,
          emailVerified: users.emailVerified,
          suspended: users.suspended,
          gender: users.gender,
          birthdate: users.birthdate,
          locale: users.locale,
          zoneinfo: users.zoneinfo,
          phoneNumber: users.phoneNumber,
          phoneNumberVerified: users.phoneNumberVerified,
          address: users.address,
          metaData: users.metaData,
          customData: users.customData,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .prepare("update_user");

      const result = await ps.execute();

      return result[0];
    } catch (error) {
      if (error instanceof Object && "name" in error) {
        if (error.name === "PostgresError") {
          const pgError = error as PostgresError;

          if (pgError.code === "23505") {
            throw new OidcError({
              error: "duplicate_keys",
              message: "Either email or username already exists.",
              status: 400,

              // @ts-expect-error error is of type unknown
              stack: error.stack,
            });
          }
        } else {
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
  }
}
