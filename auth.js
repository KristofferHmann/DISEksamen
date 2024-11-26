const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('Access denied');
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).send('Invalid token');
      req.user = user; // Gem brugerdata fra tokenen
      next();
    });
  }
  module.exports = { authenticateToken };  