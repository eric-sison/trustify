import { type KeyLike } from "jose";
import { Nullable } from "@trustify/types/nullable-type";
import { users } from "@trustify/db/schema/users";
import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { SupportedClaims } from "./oidc-supports";

export type GenerateTokenOptions = {
  keyId: string | undefined;
  signKey: KeyLike;
  subject: string | undefined;
  audience: string | string[] | undefined;
  claims?:
    | (Omit<Partial<Nullable<SupportedClaims>>, "sub"> & {
        auth_time?: number;
        nonce?: string;
        acr?: string;
        amr?: string[];
      })
    | Omit<
        Partial<Record<(typeof oidcDiscovery.claims_supported)[number], Record<"essential", boolean>>>,
        "sub"
      >;
  expiration: number | undefined;
};

export type UserClaims = Omit<typeof users.$inferSelect, "createdAt" | "role" | "password" | "suspended">;
