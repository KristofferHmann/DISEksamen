const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const responseTime = require('response-time')
const router = require('./routes.js');
require('dotenv').config();


const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, "client")));

app.use("/static", express.static("client"));
app.use((req, res, next) => {
  //console.log("----- HTTP Request -----");
  //console.log(`Method: ${req.method}`); // HTTP Method
  //console.log(`URL: ${req.originalUrl}`); // Requested URL
  //console.log("Headers:", req.headers); // Request Headers
  //console.log(`IP: ${req.ip}`); // IP Address
  //console.log("------------------------");
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


app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
