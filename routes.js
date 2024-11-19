const express = require('express');
//const jwt = require('jsonwebtoken');
const database = require('./database.js');



const router = express.Router();


  //post endpoint to handle signup
  router.post('/signup', async (req, res) => {
      try {
        const user = req.body; // Henter brugerdata fra request body
        user.created_at = new Date().toISOString(); // Add timeCreated field
        const rowsAffected = await database.signupUser(user); // Registrerer brugeren i databasen
      
        res.status(201).json({ rowsAffected }); // Sender antallet af påvirkede rækker tilbage
      } catch (err) {
        res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
      }
    
    const userData = req.body;
    console.log('User Data:', userData);
  });



  module.exports = router;