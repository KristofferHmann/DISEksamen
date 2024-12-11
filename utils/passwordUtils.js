const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Nøgle og algoritme til symmetrisk kryptering
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');  // Generer en 256-bit nøgle én gang og gem sikkert (fx i en .env-fil)
const IV_LENGTH = 16; // Initialiseringsvektor længde
const ALGORITHM = 'aes-256-cbc';

// Hash a password
async function hashPassword(plainPassword) {
  const saltRounds = 10; // Adjust salt rounds for security and performance
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
}
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
};

// Verify a password
async function verifyPassword(plainPassword, hashedPassword) {

  if (!plainPassword || !hashedPassword) {
    throw new Error('Both plain password and hashed password are required');
  }
  const result = await bcrypt.compare(plainPassword, hashedPassword);
  return result;
}



//symmetrisk kryptering
function encryptDeterministic(data) {
  // Derive a fixed IV based on the plaintext data
  const iv = crypto.createHash('sha256').update(data.trim()).digest().slice(0, IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data.trim(), 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted; // Return only the encrypted data, as IV is derived
}

function decryptDeterministic(encryptedData, originalData) {
  if (!originalData || typeof originalData !== 'string') {
    throw new Error('Original data is required for deterministic decryption.');
  }
  // Derive the IV based on the original plaintext
  const iv = crypto.createHash('sha256').update(originalData.trim()).digest().slice(0, IV_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}



function encrypt(data) {
  const iv = crypto.randomBytes(IV_LENGTH); // Generate a random IV
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'), // Return IV for storage
  };
}

function decrypt(encryptedData, iv) {
  if (!iv) throw new Error('IV is required for decryption.');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

module.exports = {
  hashPassword,
  verifyPassword,
  validatePassword,
  encrypt,
  decrypt,
  encryptDeterministic,
  decryptDeterministic,
};