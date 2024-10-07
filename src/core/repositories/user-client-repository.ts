import { db } from "@trustify/config/postgres";
import { sql, eq, and } from "drizzle-orm";
import { clients } from "@trustify/db/schema/clients";
import { userClients } from "@trustify/db/schema/user-clients";
import { users } from "@trustify/db/schema/users";
import { OidcError } from "@trustify/types/oidc-error";

export class UserClientRepository {
  public async signInUser() {}

  public async getUserClientByIds(userId: string, clientId: string) {
    try {
      const ps = db
        .select({
          userId: users.id,
          email: users.email,
          emailVerified: users.emailVerified,
          suspended: users.suspended,
          picture: users.picture,
          givenName: users.givenName,
          middleName: users.middleName,
          familyName: users.familyName,
          clientId: clients.id,
          client: clients.name,
          description: clients.description,
          logo: clients.logo,
          termsOfUseUrl: clients.termsOfUseUrl,
          privacyPolicyUrl: clients.privacyPolicyUrl,
        })
        .from(userClients)
        .innerJoin(clients, eq(userClients.clientId, clients.id))
        .innerJoin(users, eq(userClients.userId, users.id))
        .where(
          and(
            eq(userClients.userId, sql.placeholder("userId")),
            eq(userClients.clientId, sql.placeholder("clientId")),
          ),
        )
        .prepare("get_user_client_by_ids");

      const result = await ps.execute({ userId, clientId });

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

  public async updateSignInDetails(
    sessionId: string,
    userId: string,
    clientId: string,
    signInDate: Date,
    userAgent: string | undefined,
  ) {
    try {
      const ps = db
        .update(userClients)
        .set({
          sessionId: sessionId,
          lastSignInAt: signInDate,
          userAgent: userAgent,
        })
        .where(and(eq(userClients.userId, userId), eq(userClients.clientId, clientId)))
        .returning({
          userId: userClients.userId,
          clientId: userClients.clientId,
          userAgent: userClients.userAgent,
          lastSignInAt: userClients.lastSignInAt,
        })
        .prepare("update_user_client_signin_date");

      const result = await ps.execute();

      return result[0];
    } catch (error) {
      console.log(error);

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
