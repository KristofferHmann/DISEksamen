require('dotenv').config();

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

console.log('JWT_SECRET:', JWT_SECRET);

try {
  const token = jwt.sign({ id: 1, username: 'hans' }, JWT_SECRET, { expiresIn: '1h' });
  console.log('Genereret token:', token);
} catch (err) {
  console.error('Fejl under token-generering:', err.message);
}