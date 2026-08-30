import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ENCRYPTED_PREFIX = "ffenc:v1:";
const KEY_ENV = "PARTNER_DATA_ENCRYPTION_KEY";

export class SensitiveDataConfigurationError extends Error {
  constructor(message = `${KEY_ENV} must be a 32-byte key encoded as base64 or 64 hexadecimal characters.`) {
    super(message);
    this.name = "SensitiveDataConfigurationError";
  }
}

function encryptionKey(): Buffer {
  const raw = process.env[KEY_ENV]?.trim();
  if (!raw) throw new SensitiveDataConfigurationError();

  const key = /^[0-9a-fA-F]{64}$/.test(raw)
    ? Buffer.from(raw, "hex")
    : Buffer.from(raw, "base64");

  if (key.length !== 32) throw new SensitiveDataConfigurationError();
  return key;
}

export function assertSensitiveDataEncryptionConfigured(): void {
  encryptionKey();
}

export function isSensitiveDataEncrypted(value: string | null | undefined): boolean {
  return Boolean(value?.startsWith(ENCRYPTED_PREFIX));
}

export function encryptSensitiveData(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSensitiveData(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!isSensitiveDataEncrypted(value)) return value;

  const encoded = value.slice(ENCRYPTED_PREFIX.length);
  const [ivPart, tagPart, dataPart, ...extra] = encoded.split(".");
  if (!ivPart || !tagPart || !dataPart || extra.length) {
    throw new Error("Encrypted partner data is malformed.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
