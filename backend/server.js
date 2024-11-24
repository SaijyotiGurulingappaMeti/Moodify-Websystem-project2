const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const { ImageAnnotatorClient } = require("@google-cloud/vision");
const cors = require("cors");
const qs = require("querystring");
const session = require("express-session");
const { db } = require("./config/firebaseConfig");

require("dotenv").config();

const app = express();
const client = new ImageAnnotatorClient();

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

//login function

app.get("/auth/login", (req, res) => {
  const authURL = `https://www.pinterest.com/oauth/?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=user_accounts:read,pins:read,boards:read`;
  res.redirect(authURL);
});

//callback function

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query; // Get the authorization code from the query string

  if (!code) {
    return res.status(400).send("No authorization code found");
  }

  try {
    //Token Exchange request
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
    req.session.accessToken = response.data.access_token; // You can save the access token to your session or database here
    console.log("Access token stored in session:", req.session.accessToken);

    res.redirect("http://localhost:5173/dashboard");
  } catch (error) {
    console.error("Error during token exchange:", error);
    res.status(500).send("Internal server error");
  }
});

// fetch userinfo

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
    const { id, username, profile_image } = userResponse.data;
    console.log("User ID:", id);
    console.log("Data to save to Firestore:", { username, profile_image });
    console.log("Profile image type:", typeof profile_image);

    // Validate ID format (Firestore can have issues with certain characters)
    if (typeof id !== "string" || id.length === 0) {
      console.error("Invalid user ID:", id);
      return res.status(400).send("Invalid user ID");
    }

    try {
      const userRef = db.collection("users").doc(id.toString());
      await userRef.set({
        username: username,
        profile_image: profile_image,
      });
      console.log("Saved succesfully");
    } catch (error) {
      console.error("Error saving user data to Firestore:", error.message);
    }

    res.json(userResponse.data);
  } catch (error) {
    res.status(500).send("Error fetching user info: " + error.message);
  }
});

//fetch pins

app.get("/auth/pins", async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).send("User not authenticated");
  }

  try {
    const pinsResponse = await axios.get("https://api.pinterest.com/v5/pins", {
      headers: {
        Authorization: `Bearer ${req.session.accessToken}`,
      },
    });
    const pins = pinsResponse.data.items.map((pin) => ({
      id: pin.id,
      title: pin.title || "Untitled",
      description: pin.description || "No description",
      link: pin.link || "No link available",
      imageUrl: pin.media?.images?.["600x"]?.url || "No image available",
      dominantColor: pin.dominant_color || "#000000",
      boardOwner: pin.board_owner?.username || "Unknown",
      createdAt: pin.created_at,
    }));

    // console.log(pins); // For debugging
    res.json(pins);
  } catch (error) {
    if (error.response) {
      console.error("Error fetching pins:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      res
        .status(error.response.status)
        .send(
          "Error fetching pins info: " + JSON.stringify(error.response.data)
        );
    } else if (error.request) {
      console.error("Error fetching pins (no response):", error.request);
      res
        .status(500)
        .send("Error fetching pins info: No response from Pinterest API");
    } else {
      // Something happened in setting up the request
      console.error("Error fetching pins (setup):", error.message);
      res.status(500).send("Error fetching pins info: " + error.message);
    }
  }
});
//Vision api implementation
app.post("/auth/sendPin", async (req, res) => {
  const { pinId, imageUrl, userId, username } = req.body;
  console.log("Received request body:", req.body);

  // Map of likelihood values to numerical scores
  const likelihoodMap = {
    VERY_LIKELY: 5,
    LIKELY: 4,
    POSSIBLE: 3,
    UNLIKELY: 2,
    VERY_UNLIKELY: 1,
  };

  try {
    const [result] = await client.faceDetection(imageUrl);
    const faces = result.faceAnnotations;

    if (faces.length === 0) {
      console.log("No faces detected");
      return res.status(200).json({
        message: "No faces detected",
        emotion: null,
      });
    }

    // Extract likelihoods for emotions
    const face = faces[0]; // Taking the first detected face
    const emotions = {
      joy: likelihoodMap[face.joyLikelihood] || 0,
      sorrow: likelihoodMap[face.sorrowLikelihood] || 0,
      anger: likelihoodMap[face.angerLikelihood] || 0,
      surprise: likelihoodMap[face.surpriseLikelihood] || 0,
    };

    // Determine the most probable emotion
    const mostProbableEmotion = Object.keys(emotions).reduce((a, b) =>
      emotions[a] > emotions[b] ? a : b
    );

    console.log("Most probable emotion:", mostProbableEmotion);
    try {
      const emoRef = db.collection("pin-emotion").doc(pinId.toString());
      await emoRef.set({
        imageUrl: imageUrl,
        userId: userId,
        username: username,
        emotion: mostProbableEmotion,
      });
      console.log("Saved pin info successfully");
    } catch (error) {
      console.error(
        "Error saving pin emotion data to Firestore:",
        error.message
      );
    }
    // Return the most probable emotion
    res.status(200).json({
      message: "Emotion detected",
      mostProbableEmotion,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error processing the image", error: err.message });
  }
});

//Logout functionality
app.get("/auth/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Could not log out. Please try again.");
      }
      // Redirect to the client-side app after logout
      console.log("Logged out succesfully");
      res.status(200).send("Logged out successfully");
    });
  } else {
    res.status(200).send("No active session to log out from.");
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
