import CryptoJS from 'crypto-js';

// Load the secret key (32 bytes / 256 bits for AES-256)
const SECRET_KEY_STRING = import.meta.env.VITE_PAYLOAD_SECRET || 'fallback_secret_must_be_32_chars!';
const key = CryptoJS.enc.Utf8.parse(SECRET_KEY_STRING);

/**
 * Encrypts a JSON object/string into an AES-256-CBC ciphertext with PKCS7 padding.
 * Generates a random 16-byte IV for every encryption.
 * Returns: Base64(IV) + ":" + Base64(Ciphertext)
 */
export const encryptPayload = (data: any): string => {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  
  // Generate 16 bytes of random IV
  const iv = CryptoJS.lib.WordArray.random(16);
  
  // Encrypt
  const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  // Return formatted payload
  const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
  const ciphertextBase64 = encrypted.toString(); // CryptoJS default toString() is Base64
  
  return `${ivBase64}:${ciphertextBase64}`;
};

/**
 * Decrypts a payload string of format Base64(IV):Base64(Ciphertext)
 * Returns the parsed JSON object, or throws if decryption fails.
 */
export const decryptPayload = (payloadString: string): any => {
  if (!payloadString || !payloadString.includes(':')) {
    throw new Error('Invalid encrypted payload format');
  }

  const [ivBase64, ciphertextBase64] = payloadString.split(':');
  
  const iv = CryptoJS.enc.Base64.parse(ivBase64);
  
  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(ciphertextBase64, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
  
  if (!decryptedString) {
    throw new Error('Payload decryption failed (Bad Key or Corrupted Data)');
  }

  try {
    return JSON.parse(decryptedString);
  } catch (e) {
    // If it's just a raw string instead of JSON, return the string
    return decryptedString;
  }
};
