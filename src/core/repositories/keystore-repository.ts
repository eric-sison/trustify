import { keyStore } from "@trustify/db/schema/keystore";
import { OidcError } from "../types/oidc-error";
import { db } from "@trustify/config/postgres";
import { eq, sql } from "drizzle-orm";
import { KEY_STATUS } from "@trustify/utils/constants";

export type KeyStatus = (typeof KEY_STATUS)[number];

export class KeyStoreRepository {
  public async createKey(key: typeof keyStore.$inferInsert) {
    try {
      const ps = db
        .insert(keyStore)
        .values(key)
        .returning({
          id: keyStore.id,
          privateKey: keyStore.privateKey,
          publicKey: keyStore.publicKey,
          status: keyStore.status,
          encryptionKey: keyStore.encryptionKey,
          createdAt: keyStore.createdAt,
          updatedAt: keyStore.updatedAt,
        })
        .prepare("create_key");

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

  public async updateKeyStatus(keyId: string, status: KeyStatus) {
    try {
      const ps = db
        .update(keyStore)
        .set({ status, updatedAt: new Date() })
        .where(eq(keyStore.id, keyId))
        .prepare("update_key_status");

      const result = await ps.execute({ status });

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

  public async getKeyByStatus(status: KeyStatus) {
    try {
      const ps = db
        .select()
        .from(keyStore)
        .where(eq(keyStore.status, sql.placeholder("status")))
        .prepare("get_key_status");

      const result = await ps.execute({ status });

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

  public async getPublicKeys() {
    try {
      const ps = db
        .select({ publicKey: keyStore.publicKey })
        .from(keyStore)
        // .where(eq(keyStore.status, sql.placeholder("status")))
        .prepare("get_public_keys");

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
}
