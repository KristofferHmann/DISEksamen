const express = require('express');
//const jwt = require('jsonwebtoken');
const database = require('./database.js');
const router = express.Router();
const path = require('path');
require('dotenv').config();
 
//const nodemailer = require('nodemailer'); 

//signup endpoint
router.get('/signup/', (req, res) => {
  console.log(path.join(__dirname, "client/pages", "signup.html")); 
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.sendFile(path.join(__dirname, "client/pages", "signup.html"));
});

//post endpoint to handle signup
router.post('/signup', async (req, res) => {
    try {
      const user = req.body; // Henter brugerdata fra request body
      user.created_at = new Date().toISOString(); // Add timeCreated field
      const rowsAffected = await database.signupUser(user); // Registrerer brugeren i databasen
      
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      // Set JWT as cookie
      res.cookie('token', token, { httpOnly: true, secure: true });

      res.status(201).json({ rowsAffected }); // Sender antallet af påvirkede rækker tilbage
    } catch (err) {
      res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
    }
    
    const userData = req.body;
    console.log('User Data:', userData);
  });


//login endpoint
router.get('/login/', (req, res) => {
  console.log(path.join(__dirname, "client/pages", "login.html"));
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.sendFile(path.join(__dirname, "client/pages", "login.html"));
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  const customer = customers.find(
    (user) => user.username === username && user.password === password
  );

  if (customer) {
    res
      .cookie("userAuth", username, {
        maxAge: 3600000,
      })
      .send({ message: "Du er blevet logget ind" })
      .status(200);
  } else {
    res.status(401).send({ message: "Forkert brugernavn eller adgangskode" });
  }
});

/*router.get("/protected", (req, res) => {
  const authCookie = req.cookies.userAuth;

  if (!authCookie) {
    return res.status(401).send("Ingen authentication cookie.");
  }

  const customer = customers.find((user) => user.username === authCookie);

  if (!customer) {
    return res.status(401).send("Ugyldig cookie.");
  }

  res.send(`Velkommen ${customer.username}`);
});*/

router.post("/email", async (req, res) => {
  const { email } = req.body;
  const sender = "JOE <cviktorbnowak17@gmail.com>";
  const subjectMsg = "Welcome to JOE";
  const textMsg = "Welcome to JOE";
  const htmlMsg = "<h1>Welcome to JOE</h1>";

  try {
    const info = await transporter.sendMail({
      from: sender,
      to: email,
      subject: subjectMsg,
      text: textMsg,
      html: htmlMsg,
    });
    console.log("Message sent: %s", info.messageId);
    res.json({ message: `Email sendt til ${email}` });
  } catch (error) {
    console.error(error);
    res.json({ message: "Email kunne ikke sendes" });
  }
});
  module.exports = router;