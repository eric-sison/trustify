import { createCipheriv, createDecipheriv, createHash, generateKeyPairSync, randomBytes } from "crypto";
import { KeyStoreRepository } from "../repositories/keystore-repository";
import { generateIdFromEntropySize } from "lucia";
import { appConfig } from "@trustify/config/environment";
import { exportJWK, importPKCS8, importSPKI, SignJWT } from "jose";
import { OidcError } from "../types/oidc-error";

export class KeyStoreService {
  private readonly algorithm = "aes-256-cbc";

  private readonly ivLength = 16;

  constructor(private readonly keyStoreRepository: KeyStoreRepository) {}

  public async extractKeysFromCurrent() {
    // get the private key by clientId and status equals to "current"
    const key = await this.keyStoreRepository.getKeyByStatus("current");

    // decrypt the encryption key to decrypt the private_key
    const decryptedEncryptionKey = this.decryptKey(key.encryptionKey, appConfig.masterKeyEncryptionSecret);

    // decrypt the private_key using the decrypted encryption key
    const decryptedPrivateKey = this.decryptKey(key.privateKey, decryptedEncryptionKey);

    // get the PEM-encoded string
    const privateKeyPKCS8 = await importPKCS8(decryptedPrivateKey, "RS256");

    // Return the extracted keys
    return { privateKeyPKCS8, privateKey: decryptedPrivateKey, publicKey: key.publicKey };
  }

  public async createKey() {
    const key = await this.keyStoreRepository.getKeyByStatus("current");

    if (key) {
      await this.keyStoreRepository.updateKeyStatus(key.id, "previous");
    }

    const clientSecretKey = generateIdFromEntropySize(32);

    const encryptedSecretKey = this.encryptKey(clientSecretKey, appConfig.masterKeyEncryptionSecret);

    const keyPair = this.generateRSAKeyPair(2048);

    const encryptedPrivateKey = this.encryptKey(keyPair.privateKey, clientSecretKey);

    const publicKey = await importSPKI(keyPair.publicKey, "RSA");

    const publicJWK = await exportJWK(publicKey);

    const newKey = await this.keyStoreRepository.createKey({
      encryptionKey: encryptedSecretKey,
      privateKey: encryptedPrivateKey,
      publicKey: {
        ...publicJWK,
        kid: generateIdFromEntropySize(16),
        alg: "RS256",
        use: "sig",
      },
    });

    return newKey.publicKey;
  }

  private deriveKey(masterKey: string) {
    try {
      // Create a hash from the master key and truncate/pad it to 32 bytes
      return createHash("sha256").update(masterKey).digest();

      // Handle error when deriving new key
    } catch (error) {
      throw new OidcError({
        error: "failed_key_derivation",
        message: "Failed to derive key from master key.",
        status: 500,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }

  private encryptKey(text: string, key: string) {
    try {
      // Initialize iv for encrypting the plain text
      const iv = randomBytes(this.ivLength);

      // Derive a key from masterKey
      const masterKey = this.deriveKey(key);

      // Create cipher a instance
      const cipher = createCipheriv(this.algorithm, masterKey, iv);

      // start encryptinG the text
      let encryptionData = cipher.update(text, "utf8", "hex");

      // finalize the encryption
      encryptionData += cipher.final("hex");

      // return the ecncrypted text and its iv seprated by dot "."
      return `${iv.toString("hex")}.${encryptionData}`;
    } catch (error) {
      throw new OidcError({
        error: "encryption_failed",
        message: "Failed to encrypt key.",
        status: 500,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }

  public decryptKey(encryptedText: string, key: string) {
    try {
      // Split iv and encrypted data
      const [iv, encryptedData] = encryptedText.split(".");

      // Derive the masterKey
      const masterKey = this.deriveKey(key);

      // Create decipher instance
      const decipher = createDecipheriv(this.algorithm, masterKey, Buffer.from(iv, "hex"));

      // Start decrypting the encrypted data
      let decryptedData = decipher.update(encryptedData, "hex", "utf8");

      // Finalize decryption
      decryptedData += decipher.final("utf8");

      // Return decrypted data
      return decryptedData;
    } catch (error) {
      throw new OidcError({
        error: "decryption_failed",
        message: "Failed to decrypt key.",
        status: 500,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }

  private generateRSAKeyPair(size: number) {
    try {
      const { privateKey, publicKey } = generateKeyPairSync("rsa", {
        modulusLength: size, // Key size in bits
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });

      return { privateKey, publicKey };
    } catch (error) {
      throw new OidcError({
        error: "key_pair_generation_failed",
        message: "Failed to generate a new key pair.",
        status: 500,

        // @ts-expect-error error is of type unknown
        stack: error.stack,
      });
    }
  }
}
