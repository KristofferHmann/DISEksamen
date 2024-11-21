const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const responseTime = require('response-time')
const router = require('./routes.js');
require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);


const app = express();

app.use(cors());
app.use("/static", express.static("client"));
app.use((req, res, next) => {
  console.log("----- HTTP Request -----");
  console.log(`Method: ${req.method}`); // HTTP Method
  console.log(`URL: ${req.originalUrl}`); // Requested URL
  console.log("Headers:", req.headers); // Request Headers
  console.log(`IP: ${req.ip}`); // IP Address
  console.log("------------------------");
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use(responseTime())
app.use('/', router);

// Opgave 1: Lav et POST /login endpoint der tager imod brugernavn og adgangskode
//Dette information skal ind i en .env fil
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "viktorbnowak17@gmail.com",
    pass: "fuhomtcygtrdrrkk",
  },
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/pages", "index.html"));
});

app.get("/locations", (req, res) => {
  res.sendFile(path.join(__dirname, "client/pages", "locations.html"));
});

app.get("/res", (req, res) => {
  res.send("Response message from server");
});

app.get("/cookie", (req, res) => {
  res.cookie("taste", "chocolate");
  res.send("Cookie set");
});

// Opgave 2: Lav et POST /email asynkront endpoint der sender en email til modtageren

// Tag imod modtagerens emailadresse i req.body og lav try catch for at sende email
// Brug console.log(req.body) for at se indholdet af req.body og få fat i emailadressen
// Link til dokumentation: https://expressjs.com/en/api.html#req.body

// Send svar tilbage til klienten om at emailen er sendt med res.json og et message objekt
// Link til dokumentation: https://expressjs.com/en/api.html#res.json

app.post("/email", async (req, res) => {
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

/*app.post("/login", (req, res) => {
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
});*/


/*app.get("/protected", (req, res) => {
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

/*app.get('/culture', (req, res) => {
  // Set Cache-Control header to prevent caching
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.sendFile(path.join(__dirname, "client/pages", "culture.html"));
})

app.get('/culture/image', (req, res) => {
  // Set cache-control and pragma headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.sendFile(path.join(__dirname, "client/img", "cbs.jpeg"));
}); */

//login endpoint
/*app.get('/login/', (req, res) => {
  console.log(path.join(__dirname, "client/pages", "login.html"));
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.sendFile(path.join(__dirname, "client/pages", "login.html"));
});

//signup endpoint
app.get('/signup/', (req, res) => {
  console.log(path.join(__dirname, "client/pages", "signup.html")); 
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.sendFile(path.join(__dirname, "client/pages", "signup.html"));
});*/

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});