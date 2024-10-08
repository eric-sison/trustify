import { db } from "@trustify/config/postgres";
import { clients } from "@trustify/db/schema/clients";
import { OidcError } from "@trustify/core/types/oidc-error";
import { sql, eq } from "drizzle-orm";

export class ClientRepository {
  public async getClientById(clientId: string) {
    try {
      const ps = db
        .select()
        .from(clients)
        .where(eq(clients.id, sql.placeholder("clientId")))
        .prepare("get_client_by_id");

      const result = await ps.execute({ clientId });

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
