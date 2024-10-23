import { db } from "@trustify/config/postgres";
import { OidcError } from "../types/oidc-error";
import { refreshTokens } from "@trustify/db/schema/refresh-tokens";
import { eq } from "drizzle-orm";

export class RefreshTokenRepository {
  public async renewToken(oldTokenId: string, token: typeof refreshTokens.$inferInsert) {
    try {
      const res = await db.transaction(async (tx) => {
        await tx.delete(refreshTokens).where(eq(refreshTokens.id, oldTokenId));
        return await db.insert(refreshTokens).values(token).returning({
          id: refreshTokens.id,
          refreshToken: refreshTokens.token,
          expiresAt: refreshTokens.expiresAt,
        });
      });

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

  public async getRefreshTokenById(id: string) {
    try {
      const ps = db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.id, id))
        .prepare("get_refresh_tokenBy_id");

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

  public async createRefreshToken(token: typeof refreshTokens.$inferInsert) {
    try {
      const ps = db
        .insert(refreshTokens)
        .values(token)
        .returning({ id: refreshTokens.id, refreshToken: refreshTokens.token })
        .prepare("create_refresh_token");

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
