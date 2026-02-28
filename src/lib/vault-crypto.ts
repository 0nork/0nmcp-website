/**
 * Shared vault encryption utilities
 * Used by both the console vault hook and the account page.
 * AES-256-GCM with PBKDF2-SHA-256 key derivation.
 */

const ITERATIONS = 100_000;

/** Derive an AES-256-GCM key from userId + salt */
async function deriveKey(userId: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(userId),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Encrypt plaintext → { encrypted, iv, salt } all base64 */
export async function encryptVaultData(
  userId: string,
  plaintext: string
): Promise<{ encrypted: string; iv: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(userId, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
  };
}

/** Decrypt base64 encrypted data back to plaintext */
export async function decryptVaultData(
  userId: string,
  encryptedB64: string,
  ivB64: string,
  saltB64: string
): Promise<string> {
  const encrypted = Uint8Array.from(atob(encryptedB64), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const key = await deriveKey(userId, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}
