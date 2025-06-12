// utils/googleOAuth.js

const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Function to generate OAuth URL
const getAuthUrl = () => {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  return oauth2Client.generateAuthUrl({
    access_type: "online", // To get a refresh token
    scope: scopes,
  });
};

module.exports = { oauth2Client, getAuthUrl };
