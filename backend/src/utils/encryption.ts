import crypto from 'crypto';
import { getConfig } from '../config';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const raw = getConfig().DATA_ENCRYPTION_KEY;
  if (!raw || raw.length === 0) {
    throw new Error('DATA_ENCRYPTION_KET (or DATA_ENCRYPTION_KEY) must be set');
  }
  return crypto.createHash('sha256').update(raw).digest();
}

/**
 * Encrypts a plain text string. IV is prepended to the ciphertext (first 16 bytes).
 */
export function encrypt(plainText: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  return Buffer.concat([iv, encrypted]).toString('base64');
}

/**
 * Decrypts a string produced by encrypt(). Expects IV as first 16 bytes (base64 encoded together).
 */
export function decrypt(cipherText: string): string {
  const key = getEncryptionKey();
  const buf = Buffer.from(cipherText, 'base64');
  const iv = buf.subarray(0, IV_LENGTH);
  const data = buf.subarray(IV_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  return decipher.update(data) + decipher.final('utf8');
}
