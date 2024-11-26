const bcrypt = require('bcrypt');

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
  console.log("Password match result:", result); // Log the result of bcrypt.compare
  return result;
}
module.exports = {
  hashPassword,
  verifyPassword,
  validatePassword
};