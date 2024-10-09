import { type KeyLike } from "jose";

export type GenerateTokenOptions = {
  keyId: string | undefined;
  privateKey: KeyLike;
  subject: string;
  audience: string | string[] | undefined;
  customClaims?: object;
  expiration: number | undefined;
};
