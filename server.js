const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const responseTime = require('response-time')
const router = require('./routes.js');
require('dotenv').config();


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

app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "client/pages", "menu.html"));
});
// Opgave 2: Lav et POST /email asynkront endpoint der sender en email til modtageren

// Tag imod modtagerens emailadresse i req.body og lav try catch for at sende email
// Brug console.log(req.body) for at se indholdet af req.body og få fat i emailadressen
// Link til dokumentation: https://expressjs.com/en/api.html#req.body

// Send svar tilbage til klienten om at emailen er sendt med res.json og et message objekt
// Link til dokumentation: https://expressjs.com/en/api.html#res.json



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