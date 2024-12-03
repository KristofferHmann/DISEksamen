const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require("path");
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
    return res.status(401).send('You must be logged in to access this page');   
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).send('Invalid token');
      req.user = user; // Gem brugerdata fra tokenen
      next();
    });
  }

  function authenticateTokenToSpin(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
      // Return a custom message for unauthenticated users
      return res.status(401).sendFile(path.join(__dirname, "client/pages", "notLoggedIn.html"));
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        // Return the same message for invalid tokens
        return res.status(403).sendFile(path.join(__dirname, "client/pages", "notLoggedIn.html"));
      }
      req.user = user;
      next();
    });
  }
  module.exports = { authenticateToken, authenticateTokenToSpin };  