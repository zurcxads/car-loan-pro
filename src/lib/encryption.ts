import type * as NodeCrypto from 'crypto';
import { serverLogger } from './server-logger';

const ENCRYPTION_PREFIX = 'enc:v1';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getNodeCrypto(): typeof NodeCrypto | null {
  if (typeof window !== 'undefined') {
    return null;
  }

  const runtimeRequire = eval('require') as NodeRequire;
  return runtimeRequire('crypto') as typeof NodeCrypto;
}

function getEncryptionKey(key: string | undefined): Buffer | null {
  if (!key) {
    return null;
  }

  const normalizedKey = key.trim();
  if (!/^[0-9a-fA-F]{64}$/.test(normalizedKey)) {
    serverLogger.warn('ENCRYPTION_KEY must be a 32-byte hex string. Falling back to plaintext handling.');
    return null;
  }

  return Buffer.from(normalizedKey, 'hex');
}

export function encrypt(text: string, key: string | undefined): string {
  const nodeCrypto = getNodeCrypto();
  const encryptionKey = getEncryptionKey(key);
  if (!encryptionKey || !nodeCrypto) {
    return text;
  }

  const iv = nodeCrypto.randomBytes(IV_LENGTH);
  const cipher = nodeCrypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

export function decrypt(ciphertext: string, key: string | undefined): string {
  const nodeCrypto = getNodeCrypto();
  const encryptionKey = getEncryptionKey(key);
  if (!encryptionKey || !nodeCrypto || !ciphertext.startsWith(`${ENCRYPTION_PREFIX}:`)) {
    return ciphertext;
  }

  const [, , ivPart, authTagPart, encryptedPart] = ciphertext.split(':');
  if (!ivPart || !authTagPart || !encryptedPart) {
    return ciphertext;
  }

  try {
    const iv = Buffer.from(ivPart, 'base64');
    const authTag = Buffer.from(authTagPart, 'base64');
    const encrypted = Buffer.from(encryptedPart, 'base64');

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      return ciphertext;
    }

    const decipher = nodeCrypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch {
    return ciphertext;
  }
}
