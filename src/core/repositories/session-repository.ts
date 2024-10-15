import { db } from "@trustify/config/postgres";
import { clients } from "@trustify/db/schema/clients";
import { sessions } from "@trustify/db/schema/sessions";
import { users } from "@trustify/db/schema/users";
import { OidcError } from "@trustify/core/types/oidc-error";
import { eq } from "drizzle-orm";

export class SessionRepository {
  public async getSessionDetails(sid: string) {
    try {
      const ps = db
        .select({
          id: sessions.id,
          userId: users.id,
          clientId: clients.id,
          client: clients.name,
          description: clients.description,
          logo: clients.logo,
          termsOfUseUrl: clients.termsOfUseUrl,
          privacyPolicyUrl: clients.privacyPolicyUrl,
          email: users.email,
          givenName: users.givenName,
          middleName: users.middleName,
          familyName: users.familyName,
          preferredUsername: users.preferredUsername,
          picture: users.picture,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .innerJoin(clients, eq(sessions.clientId, clients.id))
        .where(eq(sessions.id, sid))
        .prepare("get_session_details");

      const res = await ps.execute();

      return res[0];
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
