import express from 'express';  
import database from './database';
import jwt from 'jsonwebtoken';






  //post endpoint to handle signup
  app.post('/signup', async (req, res) => {
      try {
        const user = req.body; // Henter brugerdata fra request body
        const rowsAffected = await database.signupUser(user); // Registrerer brugeren i databasen
        res.status(201).json({ rowsAffected }); // Sender antallet af påvirkede rækker tilbage
      } catch (err) {
        res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
      }
    
    const userData = req.body;
    console.log('User Data:', userData);
  });