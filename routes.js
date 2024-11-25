const express = require('express');
const jwt = require('jsonwebtoken');
const { databaseInstance } = require('./database.js');
const { allQuery } = require("./database.js");
const router = express.Router();
const path = require('path');
require('dotenv').config();
const { hashPassword, verifyPassword, validatePassword } = require('./utils/passwordUtils.js');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const twilio = require('twilio');
const { channel } = require('diagnostics_channel');
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const { log } = require('util');

router.use(cookieParser());
// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});


//signup endpoint
router.get('/signup/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.sendFile(path.join(__dirname, "client/pages", "signup.html"));
});

//post endpoint to handle signup
router.post('/signup', async (req, res) => {
  try {
    const user = req.body; // Henter brugerdata fra request body

    //tjekker om adgangskoden er mindst 8 tegn lang
    if (user.password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (!validatePassword(user.password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.',
      });
    }
    //hasher adgangskoden
    user.password = await hashPassword(user.password);

    user.created_at = new Date().toISOString(); // Add timeCreated field
    const rowsAffected = await databaseInstance.signupUser(user); // Registrerer brugeren i databasen

    const mailOptions = {
      from: `"JOE Support" <${process.env.EMAIL_USERNAME}>`, // Sender address
      to: user.email,
      subject: 'Welcome to JOE!',
      text: `Hi ${user.username}! We're super excited to have you join the Joe & The Juice family! 

Your account is all set up and ready to go. Now you can:
• Order your favorite juices, shakes, and food for pickup
• Earn points on every purchase


Pro tip: Try our legendary Tunacado sandwich with a Power Shake for the perfect energy boost!

Got questions? We're here to help! Just reply to this email or visit us in any of our shops.

Stay energized!
The Joe & The Juice Team

P.S. Follow us on Instagram @joejuice for daily inspiration and updates!`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="https://res.cloudinary.com/dfaz3ygzy/image/upload/v1732404438/JoeProject/joeLogo.svg" alt="Joe & The Juice Logo" style="max-width: 200px; margin: 20px 0;">
        
        <h1 style="color: #FF0066; margin-bottom: 20px;">Hey ${user.username}! 🌱</h1>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">We're super excited to have you join the Joe & The Juice family!</p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Your account is all set up and ready to go. Here's what you can do now:</p>
        
        <ul style="font-size: 16px; line-height: 1.5; color: #333; margin: 20px 0;">
          <li>Order your favorite juices, shakes, and food for pickup</li>
          <li>Track your orders and save your favorites</li>
        </ul>
        
        <div style="background-color: #FDBFD9; color: #23272A; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 16px; margin: 0; color: #333;">
            <strong>Pro tip:</strong> Try our legendary Tunacado sandwich with a Power Shake for the perfect energy boost! 💪
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          Got questions? We're here to help! Just reply to this email or visit us in any of our shops.
        </p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          Stay energized!<br>
          <strong>The Joe & The Juice Team</strong>
        </p>
        
        <p style="font-size: 14px; color: #666; font-style: italic; margin-top: 30px;">
          P.S. Follow us on Instagram <a href="https://instagram.com/joeandthejuice" style="color: #FF0066; text-decoration: none;">@joejuice</a> for daily inspiration and updates!
        </p>
      </div>
    `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending signup email:', error.message);
        // Log the error but don't fail the signup process
      } else {
        console.log('Signup email sent:', info.response);
      }
    });


    res.status(201).json({ rowsAffected }); // Sender antallet af påvirkede rækker tilbage
  } catch (err) {
    res.status(500).send('Server error'); // Sender fejlbesked tilbage hvis noget går galt
  }

  const userData = req.body;
});


//login endpoint
router.get('/login/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.sendFile(path.join(__dirname, "client/pages", "login.html"));
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.error('Manglende brugernavn eller adgangskode.');
    return res.status(400).send({ message: "Brugernavn og adgangskode er påkrævet" });
  }
  try {
    // Hent bruger fra databasen
    const user = await databaseInstance.getUserByUsernameAndPassword(username, password);
    console.log('5.Database resultat:', user);

    if (!user) {
      console.error('Ugyldigt brugernavn eller adgangskode.');
      // Returnér fejl, hvis brugeren ikke findes
      return res.status(401).json({ error: 'Invalid username' });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.error('Invalid password.');
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    
    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Set to true in production with HTTPS
      sameSite: 'strict',
    });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});


//Twilio OTP til bruger ved signup
router.post('/sendOtp', async (req, res) => {
  const { fullPhoneNumber } = req.body;

  console.log('Phonenumber:', fullPhoneNumber);

  if (!fullPhoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    console.log('Sending to:', `sms:${fullPhoneNumber}`);
    console.log('Using Service SID:', serviceSid);

    // Create a verification using Twilio's Verify API
    const verification = await client.verify.v2.services(serviceSid).verifications.create({
      to: `sms:${fullPhoneNumber}`, // Ensure WhatsApp prefix
      channel: 'sms',
    });

    console.log('OTP sent successfully:', verification.sid);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ error: error.message });
  }
});


//Verfiy OTP
router.post('/verifyOtp', async (req, res) => {
  const { fullPhoneNumber, otp } = req.body;

  console.log('Phonenumber:', fullPhoneNumber);
  console.log('OTP:', otp);

  if (!fullPhoneNumber || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' });
  }

  try {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // Check the verification using Twilio's Verify API
    const verificationCheck = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to: `sms:${fullPhoneNumber}`,
      code: otp,
    });

    if (verificationCheck.status === 'approved') {
      console.log('OTP verified successfully:', verificationCheck.sid);
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      console.log('Invalid OTP or verification failed:', verificationCheck.sid);
      res.status(401).json({ message: 'Invalid OTP. Please try again.' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

//cloudinary
router.get("/api/uploads", async (req, res) => {
  try {
    const uploads = await allQuery("SELECT * FROM uploads");
    res.status(200).json(uploads); // Send the data as JSON
  } catch (error) {
    console.error("Error fetching uploads:", error.message);
    res.status(500).json({ error: "Failed to fetch uploads" });
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

module.exports = router;