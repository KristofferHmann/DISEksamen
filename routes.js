const express = require('express');
const jwt = require('jsonwebtoken');
const { databaseInstance } = require('./database');
const { allQuery } = require("./database");
const { runQuery, getQuery, updateUserPoints } = require("./database");
const router = express.Router();
const path = require('path');
require('dotenv').config();
const { hashPassword, verifyPassword, validatePassword, encryptDeterministic, encrypt, decrypt } = require('./utils/passwordUtils.js');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const twilio = require('twilio');
const { channel } = require('diagnostics_channel');
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const nodemailer = require('nodemailer');
const { authenticateToken, authenticateTokenToSpin } = require('./auth.js');
const cookieParser = require('cookie-parser');
const { log } = require('util');
const { getLocations } = require('./database');
const multer = require('multer');
const cloudinary = require('./database');

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
      text: `Hi ${user.username}! Welcome to the Joe & The Juice family! We're so excited to have you on board! 

Your account is now active, and you're ready to start earning points! Here's what you can do:
• Spin the Wheel daily to earn points
• Redeem points for delicious sandwiches, coffee, or juice
• Claim your rewards at your nearest Joe & The Juice store


Pro tip: Save up your points for our legendary Tunacado sandwich – it's worth every spin!

Ready to get started? Head over to our menu to browse your reward options.

Got questions? We're here for you! Just reply to this email or visit us in any of our shops.

Stay energized and happy spinning!
The Joe & The Juice Team

P.S. Follow us on Instagram @joejuice for daily inspiration and updates!`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        
        <h1 style="color: #FF0066; margin-bottom: 20px;">Hey ${user.username}! 🌱</h1>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Welcome to the Joe & The Juice family! We're so excited to have you on board!</p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Your account is now active, and you’re ready to start earning points! Here's how it works:</p>
        
        <ul style="font-size: 16px; line-height: 1.5; color: #333; margin: 20px 0;">
    <li>Spin the Wheel daily to earn points</li>
    <li>Redeem your points for sandwiches, coffee, or juice</li>
    <li>Claim your rewards at your nearest Joe & The Juice store</li>
  </ul>
        
       <div style="background-color: #FDBFD9; color: #23272A; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="font-size: 16px; margin: 0; color: #333;">
      <strong>Pro tip:</strong> Save up your points for our legendary Tunacado sandwich – it's worth every spin! 🥪💪
    </p>
  </div>
        
       <p style="font-size: 16px; line-height: 1.5; color: #333;">Ready to get started? Head over to our menu to browse your reward options!</p>

       <p style="font-size: 16px; line-height: 1.5; color: #333;">
    Got questions? We're here for you! Just reply to this email or visit us in any of our shops.
  </p>
        
         <p style="font-size: 16px; line-height: 1.5; color: #333;">
    Stay energized and happy spinning!<br>
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
    console.error('Error during signup:', err.message);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
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
    const encryptedUsername = encryptDeterministic(username);
    console.log('Encrypted username during login:', encryptedUsername);

    const user = await databaseInstance.getUserByUsername(encryptedUsername);

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
      sameSite: 'lax',
      maxAge: 3600000, // 1 time
    });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

router.get('/api/auth-status', authenticateToken, (req, res) => {
  res.status(200).json({ loggedIn: true });
});

//LOGOUT
router.post('/logout', (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
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

router.get('/profile', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "client/pages", "profil.html"));
});

router.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, "client/pages", "menu.html"));
});

router.get('/api/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id; // From token
  try {
    const user = await databaseInstance.getUserById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err.message);
    res.status(500).send('Server error');
  }
});

router.put('/api/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  let { email, username } = req.body;

  console.log('Incoming update request:', { userId, email, username }); // Debugging log

  if (!email || !username) {
    console.error('Missing required fields:', { email, username });
    return res.status(400).json({ error: 'Email and username are required.' });
  }

  try {
    // Check if the new username is already in use by another user
    const encryptedUsername = encryptDeterministic(username); // Encrypt deterministically to match the stored value
    const existingUser = await getQuery('SELECT id FROM users WHERE username = ?', [encryptedUsername]);
    if (existingUser && existingUser.id !== userId) {
      console.error('Username already in use:', username);
      return res.status(400).json({ error: 'Username already in use.' });
    }

    // Encrypt the new email
    const { encryptedData: encryptedEmail, iv: emailIv } = encrypt(email);

    // Update the user's details in the database
    const query = `
      UPDATE users
      SET username = ?, email = ?, email_iv = ?
      WHERE id = ?
    `;
    await runQuery(query, [encryptedUsername, encryptedEmail, emailIv, userId]);

    console.log('Profile updated successfully for user:', userId);
    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

router.delete('/api/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    await runQuery('DELETE FROM users WHERE id = ?', [userId]);

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.send('Account deleted successfully');
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).send('Server error');
  }
});

//cloudinary
router.get('/api/uploads', async (req, res) => {
  try {
    const caption = req.query.caption;
    const query = caption
      ? 'SELECT * FROM uploads WHERE caption = ?'
      : 'SELECT * FROM uploads';

    const uploads = await allQuery(query, caption ? [caption] : []);
    console.log('Uploads fetched:', uploads); // Debugging log
    res.status(200).json(uploads); // Send the uploads as JSON response
  } catch (error) {
    console.error('Error fetching uploads:', error.message);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

// Multer setup for temporary file storage
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const result = await cloudinary.uploader.upload_stream({
      folder: 'joeProject', // Cloudinary folder name
    }, (error, response) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Image upload failed' });
      }

      // Response includes the image URL
      res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl: response.secure_url, // Save this URL to the menu table
      });
    });

    // Optional: You can also update the database with the URL here
  } catch (error) {
    console.error('Error uploading image:', error.message);
    res.status(500).json({ error: 'An error occurred during the image upload' });
  }
});

// Route to fetch directions
router.post('/api/directions', async (req, res) => {
  const { start, end } = req.body;

  // Validate request body
  if (
    !start || !end ||
    typeof start.lat !== 'number' || typeof start.lon !== 'number' ||
    typeof end.lat !== 'number' || typeof end.lon !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid start or end coordinates' });
  }

  try {
    const url = `https://api.openrouteservice.org/v2/directions/foot-walking`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.OPENROUTESERVICE_API_KEY, // Ensure this is set in your environment
      },
      body: JSON.stringify({
        coordinates: [[start.lon, start.lat], [end.lon, end.lat]],
        instructions: false, // Omit detailed instructions for now; change if needed
      }),
    });

    // Handle non-OK responses from OpenRouteService
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouteService API error:', errorText);
      return res.status(502).json({ error: `Failed to fetch route: ${errorText}` });
    }

    const data = await response.json();
    res.json(data); // Send the route data to the client
  } catch (error) {
    console.error('Error fetching directions:', error.message);
    res.status(500).json({ error: 'Failed to fetch directions due to server error' });
  }
});

// Endpoint to fetch Joe & The Juice locations
router.get('/api/joeJuiceLocations', async (req, res) => {
  try {
    const locations = await getLocations();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

router.get('/spin', authenticateTokenToSpin, (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.sendFile(path.join(__dirname, "client/pages", "spin.html"));
});

//spin the wheel
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Failed to retrieve user data' });
    } else {
      res.json(row);
    }
  });
});

router.post('/spin', authenticateTokenToSpin, async (req, res) => {
  try {
    const userId = req.user.id;
    const { pointsWon } = req.body; // Extract pointsWon from the request body
    console.log(`Points received from client: ${pointsWon}`);

    // Validate pointsWon
    const validPoints = [0, 10, 20, 30, 50, 100];
if (!validPoints.includes(Number(pointsWon))) {
  return res.status(400).json({ error: 'Invalid points value.' });
}

    await updateUserPoints(userId, pointsWon, 'Spin-the-Wheel');
    res.json({ pointsWon });
  } catch (error) {
    console.error('Error handling spin:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await allQuery('SELECT id, category, name, ingredient, cost, image_url FROM menu');
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error.message);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

/*router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // User ID from the JWT token
    const { menuId } = req.body; // Menu item ID sent in the request body

    // Fetch the menu item details
    const menuItem = await getQuery('SELECT * FROM menu WHERE id = ?', [menuId]);
    if (!menuItem) {
      console.log('Menu item fetched:', menuItem);
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Fetch the user's current points
    const user = await getQuery('SELECT points FROM users WHERE id = ?', [userId]);
    if (!user) {
      console.log('User fetched:', user);
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user has enough points
    if (user.points < menuItem.cost) {
      return res.status(400).json({ error: 'Not enough points to purchase this item' });
    }

    // Deduct the points from the user
    await runQuery('UPDATE users SET points = points - ? WHERE id = ?', [menuItem.cost, userId]);

    // Log the transaction
    await runQuery(
      'INSERT INTO points_transactions (user_id, change, description) VALUES (?, ?, ?)',
      [userId, -menuItem.cost, `Purchased ${menuItem.name}`]
    );

    // Record the purchase
    await runQuery(
      'INSERT INTO menu_purchases (user_id, menu_id) VALUES (?, ?)',
      [userId, menuId]
    );

    res.json({ message: `Successfully purchased ${menuItem.name}` });
  } catch (error) {
    console.error('Error handling purchase:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});*/

router.post('/purchaseItems', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { menuId } = req.body;

  try {

    // Retrieve the user's details
    const user = await getQuery('SELECT points, phonenumber, phonenumber_iv FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { points: userPoints, phonenumber, phonenumber_iv } = user;

    const decryptedPhoneNumber = decrypt(phonenumber, phonenumber_iv);
    console.log('Decrypted phone number:', decryptedPhoneNumber);

    // Retrieve the menu item details
    const menuItem = await getQuery('SELECT name, cost FROM menu WHERE id = ?', [menuId]);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const { name: menuName, cost: menuCost } = menuItem;

    // Check if the user has enough points
    if (userPoints < menuCost) {
      return res.status(400).json({ error: 'Not enough points to purchase this item' });
    }

    // Deduct points from the user
    await runQuery('UPDATE users SET points = points - ? WHERE id = ?', [menuCost, userId]);

    // Log the transaction
    await runQuery(
      'INSERT INTO points_transactions (user_id, change, description) VALUES (?, ?, ?)',
      [userId, -menuCost, `Purchased ${menuName}`]
    );

    // Record the purchase
    await runQuery('INSERT INTO menu_purchases (user_id, menu_id) VALUES (?, ?)', [userId, menuId]);

    // Generate a unique code
    const code = Math.floor(1000 + Math.random() * 9000);

    // Send the code via Twilio
    const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your code for ${menuName} is ${code}. Redeem it at Joe & the Juice!`,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: decryptedPhoneNumber,
    });

    res.json({
      message: `Purchase successful! A code for ${menuName} has been sent to your phone.`,
      suggestion: 'Find your nearest store at FIND US',
    });
  } catch (error) {
    console.error('Error processing purchase:', error.message);
    res.status(500).json({ error: 'Failed to process purchase.' });
  }
});

router.get('/api/purchases', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch purchased items
    const purchases = await allQuery(
      `SELECT menu.name, menu.cost 
       FROM menu_purchases 
       INNER JOIN menu ON menu_purchases.menu_id = menu.id 
       WHERE menu_purchases.user_id = ?`,
      [userId]
    );

    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error.message);
    res.status(500).json({ error: 'Failed to fetch purchased items.' });
  }
});


module.exports = router;