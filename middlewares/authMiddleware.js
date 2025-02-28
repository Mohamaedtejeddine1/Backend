const jwt = require("jsonwebtoken");
const userModel = require("../models/userSchema");

const requireAuthUser = (req, res, next) => {
  const token = req.cookies.jwt_token_9antra;

  if (token) {
    jwt.verify(token, 'net secret pfe', async (err, decodedToken) => {
      if (err) {
        console.log("Token verification error:", err.message);
        // Send a 401 Unauthorized status and a JSON error message
        return res.status(401).json({ message: "Invalid or expired token" });
      } else {
        try {
          const user = await userModel.findById(decodedToken.id);
          if (!user) {
            return res.status(401).json({ message: "User not found" });
          }
          req.user = user; // Store the user in req.user
          next();
        } catch (error) {
          console.error("Error fetching user:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }
    });
  } else {
   
    return res.status(401).json({ message: "No token provided" });
  }
};

module.exports = { requireAuthUser };