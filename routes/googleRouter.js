const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const { oauth2Client, getAuthUrl } = require("../utils/googleOAuth");

// Store tokens in-memory (can replace with DB for persistence)
let tokens = null;

// Step 1: Redirect user to Google OAuth consent screen
router.get("/google", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// routes/google.js
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    console.error("No code found in callback request");
    return res.status(400).send('No code found');
  }

  try {
    const { tokens: newTokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(newTokens);
    console.log('Access Token:', newTokens.access_token);
    console.log('Refresh Token:', newTokens.refresh_token);

    tokens = newTokens;

    res.json({ message: "Authentication successful", tokens: newTokens });
  } catch (err) {
    console.error('Error getting tokens:', err);
    res.status(500).send('Authentication failed');
  }
});


module.exports = router;
