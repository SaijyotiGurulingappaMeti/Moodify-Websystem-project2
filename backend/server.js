const express = require("express");
const axios = require("axios");
const cors = require("cors");
const qs = require("querystring");
const session = require("express-session");
require("dotenv").config();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:4000/auth/callback";

let accessToken = null;
const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
  "base64"
);

app.get("/auth/login", (req, res) => {
  const authURL = `https://www.pinterest.com/oauth/?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=user_accounts:read`;
  res.redirect(authURL);
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query; // Get the authorization code from the query string

  if (!code) {
    return res.status(400).send("No authorization code found");
  }

  try {
    // Step 2: Token Exchange request
    const response = await axios.post(
      "https://api.pinterest.com/v5/oauth/token",
      qs.stringify({
        grant_type: "authorization_code",
        code, // The authorization code you received
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Get the access token from the response
    req.session.accessToken = response.data.access_token;
    console.log("Access token stored in session:", req.session.accessToken);

    res.redirect("http://localhost:5173/dashboard"); // // You can save the access token to your session or database here
    // res.send(`Access token obtained: ${access_token}`);
  } catch (error) {
    console.error("Error during token exchange:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/auth/userinfo", async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).send("User not authenticated");
  }

  try {
    const userResponse = await axios.get(
      "https://api.pinterest.com/v5/user_account",
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
        },
      }
    );

    res.json(userResponse.data);
  } catch (error) {
    res.status(500).send("Error fetching user info: " + error.message);
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
