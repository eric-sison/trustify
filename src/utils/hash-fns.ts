import argon2 from "argon2";

export async function verifyHash(hashed: string, plainText: string) {
  try {
    // return the result of password hash verification
    return await argon2.verify(hashed, plainText);
  } catch (error) {
    // internal failure
    throw new Error("Something went wrong while verifying the hash!", { cause: error });
  }
}

export async function createHash(plainText: string) {
  try {
    return await argon2.hash(plainText, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
      hashLength: 32,
    });
  } catch (error) {
    throw new Error("Something went wrong while creating a hash!", { cause: error });
  }
}
