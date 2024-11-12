// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/facebook-data", async (req, res) => {
  const { userId, accessToken } = req.query; // Extract userId and accessToken from query params

  if (!userId || !accessToken) {
    return res
      .status(400)
      .json({ error: "userId and accessToken are required" });
  }

  const url = `https://graph.facebook.com/${userId}?fields=id,name,email,picture,posts{id,link}&access_token=${accessToken}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch Facebook data", details: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
