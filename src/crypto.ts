import { webcrypto } from "crypto";

const { subtle } = webcrypto;

// #############
// ### Utils ###
// #############

// Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of RSA private/public keys
export async function generateRsaKeyPair() {
  const keyPair = await subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

// Export a public key to a Base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  const exported = await subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported);
}

// Export a private key to a Base64 string format
export async function exportPrvKey(
  key: webcrypto.CryptoKey | null
): Promise<string | null> {
  if (!key) return null;
  const exported = await subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(exported);
}

// Import a public key from a Base64 string
export async function importPubKey(strKey: string): Promise<webcrypto.CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(strKey);
  return await subtle.importKey(
    "spki",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
}

// Import a private key from a Base64 string
export async function importPrvKey(strKey: string): Promise<webcrypto.CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(strKey);
  return await subtle.importKey(
    "pkcs8",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(
  b64Data: string,
  strPublicKey: string
): Promise<string> {
  const publicKey = await importPubKey(strPublicKey);
  const encrypted = await subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    base64ToArrayBuffer(b64Data)
  );
  return arrayBufferToBase64(encrypted);
}

// Decrypt a message using an RSA private key
export async function rsaDecrypt(
  encryptedData: string,
  privateKey: webcrypto.CryptoKey
): Promise<string> {
  const decrypted = await subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    base64ToArrayBuffer(encryptedData)
  );
  return arrayBufferToBase64(decrypted);
}

// ######################
// ### Symmetric keys ###
// ######################

// Generate a random symmetric key (AES-CBC)
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  return await subtle.generateKey(
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export a symmetric key to Base64 format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  const exported = await subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

// Import a symmetric key from Base64 format
export async function importSymKey(strKey: string): Promise<webcrypto.CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(strKey);
  return await subtle.importKey("raw", keyBuffer, { name: "AES-CBC" }, true, [
    "encrypt",
    "decrypt",
  ]);
}

// Encrypt a message using AES-GCM
export async function symEncrypt(
  key: webcrypto.CryptoKey,
  data: string
): Promise<string> {
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);
  const encrypted = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );
  return arrayBufferToBase64(iv) + ":" + arrayBufferToBase64(encrypted);
}

// Decrypt a message using AES-GCM
export async function symDecrypt(strKey: string, encryptedData: string): Promise<string> {
  const key = await importSymKey(strKey);
  const [ivB64, cipherB64] = encryptedData.split(":"); 
  const iv = new Uint8Array(base64ToArrayBuffer(ivB64));
  const cipherBuffer = base64ToArrayBuffer(cipherB64);
  const decrypted = await subtle.decrypt({ name: "AES-GCM", iv }, key, cipherBuffer);
  return new TextDecoder().decode(decrypted);
}

