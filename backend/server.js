const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const { ImageAnnotatorClient } = require("@google-cloud/vision");
const cors = require("cors");
const qs = require("querystring");
const session = require("express-session");
const { db } = require("./config/firebaseConfig");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { messaging } = require("firebase-admin");

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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_CREDENTIALS);
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
let spotifyAccessToken = null;
let accessToken = null;

const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
  "base64"
);
//get spotify access token

const getSpotifyAccessToken = async () => {
  if (spotifyAccessToken) return spotifyAccessToken;

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
            "base64"
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  spotifyAccessToken = response.data.access_token;
  return spotifyAccessToken;
};

//get music atttributes
const getMusicAttribute = async (emotion) => {
  model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `For emotion "${emotion}", provide the following in a strict JSON object format:
{
  "min_acousticness": <value>,
  "max_acousticness": <value>,
  "target_acousticness": <value>,
  "min_danceability": <value>,
  "max_danceability": <value>,
  "target_danceability": <value>,
  "min_energy": <value>,
  "max_energy": <value>,
  "target_energy": <value>,
  "min_tempo": <value>,
  "max_tempo": <value>,
  "target_tempo": <value>
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
  console.log("Raw output:", text);
  try {
    // Extract JSON substring from text
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON object found in response");
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const attributes = JSON.parse(jsonString);
    console.log("Parsed attributes:", attributes);
    return attributes;
  } catch (error) {
    console.error("Error parsing attributes:", error);
    throw new Error("Failed to parse attributes from generative model");
  }
};
//get music recommendations

const getMusicRecommendations = async (genre, attributes) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Given the following attributes:
  ${JSON.stringify(attributes)}
  and the genre "${genre}", recommend 5 Spotify songs. Return in strict JSON format:
  [
    {
      "title": "<song title>",
      "artist": "<artist name>",
      "album": "<album name>",
      "spotify_id": "<Spotify track ID>"
    },
    ...
  ]`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
  console.log("Raw output:", text);

  try {
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON array found in response");
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const recommendations = JSON.parse(jsonString);
    console.log("Parsed recommendations:", recommendations);
    return recommendations;
  } catch (error) {
    console.error("Error parsing recommendations:", error);
    throw new Error("Failed to parse recommendations from generative model");
  }
};

//get spotify tracks
const getSpotifyTracks = async (recommendations) => {
  try {
    const accessToken = await getSpotifyAccessToken();

    const trackRequests = recommendations.map(async (rec) => {
      const url = new URL("https://api.spotify.com/v1/search");
      const query = `${rec.title} ${rec.artist}`;

      url.searchParams.append("q", query);
      url.searchParams.append("type", "track");
      url.searchParams.append("limit", "1");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(
          `Error fetching track for query "${query}": ${response.statusText}`
        );
        return null;
      }

      const data = await response.json();

      // Check if the response contains tracks
      const track = data?.tracks?.items?.[0];
      if (!track) {
        console.error(`No track found for query "${query}"`);
        return null;
      }

      return {
        id: track.id,
        title: track.name || "Unknown Title",
        artist:
          track.artists?.map((artist) => artist.name).join(", ") ||
          "Unknown Artist",
        album: track.album?.name || "Unknown Album",
        url: track.external_urls?.spotify || "#",
      };
    });

    const tracks = await Promise.all(trackRequests);
    const validTracks = tracks.filter(Boolean);

    console.log("Fetched Spotify tracks:", validTracks);

    return validTracks;
  } catch (error) {
    console.error("Error fetching Spotify tracks:", error);
    throw new Error("Failed to fetch tracks from Spotify");
  }
};

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

    // Check if the most probable emotion is VERY_UNLIKELY
    if (emotions[mostProbableEmotion] === 1) {
      console.log("Emotion likelihood is VERY_UNLIKELY");
      return res.status(200).json({
        message:
          "No faces detected or very low accurate data, please choose another picture",
        emotion: null,
      });
    }

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

//check if spotify tracks already present in backend
app.post("/auth/checkPin", async (req, res) => {
  const { pinId, userId } = req.body;

  try {
    const customId = `${pinId}_${userId}`;

    // Check if the document already exists in Firestore
    const doc = await db.collection("PinUserSpotifyTracks").doc(customId).get();

    if (doc.exists) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking pin existence:", err);
    res.status(500).json({ error: "Failed to check pin existence" });
  }
});

//fetch musicAttributes
app.post("/auth/musicAttribute", async (req, res) => {
  const { emotion, pinId, userId, username, imageUrl, genre } = req.body;
  console.log(req.body);

  try {
    const attributes = await getMusicAttribute(emotion);
    const recommendations = await getMusicRecommendations(genre, attributes);
    const spotifyTracks = await getSpotifyTracks(recommendations);

    const trackData = spotifyTracks.map((track) => ({
      id: track.id,
      name: track.title,
      artist: track.artist,
      url: track.url,
    }));

    const customId = `${pinId}_${userId}`;
    // Save to Firestore
    await db.collection("PinUserSpotifyTracks").doc(customId).set({
      pinId,
      userId,
      imageUrl,
      spotifyTracks: trackData,
      genre,
    });

    res
      .status(200)
      .json({ pinId, userId, imageUrl, tracks: spotifyTracks, genre });
  } catch (error) {
    console.error("Error in recommending music:", error);
    res.status(500).json({ error: "Failed to recommend music" });
  }
});

//fetch the pin-spotify-tracksdata
app.get("/auth/musicAttribute/:pinId/:userId", async (req, res) => {
  const { pinId, userId } = req.params;
  const customId = `${pinId}_${userId}`;

  try {
    const doc = await db.collection("PinUserSpotifyTracks").doc(customId).get();
    if (!doc.exists) {
      return res
        .status(404)
        .json({ error: "No data found for this pin and user" });
    }

    res.status(200).json(doc.data());
  } catch (error) {
    console.error("Error retrieving music data :", error);
    res.status(500).json({ error: "Failed to retrieve the music data" });
  }
});

//delete the pin-spotify-tracks data
app.delete("/auth/deleteTracks/:trackId", async (req, res) => {
  const { trackId} = req.params;

  try {
    // Locate the document with the customId
    const docRef = db.collection("PinUserSpotifyTracks").doc(trackId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res
        .status(404)
        .json({ error: "No data found for this pinId and userId" });
    }

    // Delete the document
    await docRef.delete();

    res
      .status(200)
      .json({ message: "Data successfully deleted for the pinId and userId" });
  } catch (error) {
    console.log(error);
    console.error("Error deleting music data:", error);
    res.status(500).json({ error: "Failed to delete the music data" });
  }
});

//history page
app.get("/auth/history/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await db
      .collection("PinUserSpotifyTracks")
      .where("userId", "==", userId)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No pins found" });
    }

    const pins = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(pins);
  } catch (error) {
    console.error("Error in fetching history data:", error);
    res.status(500).send({ error: "Failed to fetch the history data" });
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
