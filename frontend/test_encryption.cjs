const CryptoJS = require('crypto-js');

// Must match the payload secret
const SECRET_KEY_STRING = '48ec3b4de92e93b18e38e0852785607d';
const key = CryptoJS.enc.Utf8.parse(SECRET_KEY_STRING);

function encryptPayload(data) {
  const jsonString = JSON.stringify(data);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
  const ciphertextBase64 = encrypted.toString();
  return `${ivBase64}:${ciphertextBase64}`;
}

function decryptPayload(payloadString) {
  const [ivBase64, ciphertextBase64] = payloadString.split(':');
  const iv = CryptoJS.enc.Base64.parse(ivBase64);
  const decrypted = CryptoJS.AES.decrypt(ciphertextBase64, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedString);
}

const loginData = { username: "owner", password: "Owner@123" };
const encryptedBody = JSON.stringify({ payload: encryptPayload(loginData) });

console.log("Sending encrypted body:", encryptedBody);

fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: encryptedBody
})
.then(res => res.json())
.then(data => {
  console.log("Received encrypted response:", data);
  if (data.payload) {
    const decrypted = decryptPayload(data.payload);
    console.log("SUCCESS! Decrypted payload:", decrypted);
  } else {
    console.log("Response was not encrypted payload format:", data);
  }
})
.catch(console.error);
