const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");

const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require("node-fetch");

// Polyfill fetch for Node.js
global.fetch = fetch;
global.Headers = fetch.Headers;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

// Multer config for file upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
router.post("/cv/upload", upload.single("cv"), async (req, res) => {
    try {
      const pdfPath = req.file.path;
      const dataBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdfParse(dataBuffer);
  
      const extractedText = pdfData.text;
  
      const prompt = `
        Analyze this CV and return a JSON-formatted analysis with these exact fields:
        {
          "languages": ["array", "of", "languages"],
          "technicalSkills": ["array", "of", "technical", "skills"],
          "softSkills": ["array", "of", "soft", "skills"],
          "summary": "2-3 sentence summary text"
        }
        
        CV Content:
        ${extractedText}
        
        Return ONLY the JSON object, no additional text or explanation.
      `;
  
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      let feedback = await result.response.text();
  
      // Clean the response to extract just the JSON
      try {
        feedback = JSON.parse(feedback.trim());
      } catch (e) {
        // If parsing fails, try to extract JSON from malformed response
        const jsonMatch = feedback.match(/\{[\s\S]*\}/);
        if (jsonMatch) feedback = JSON.parse(jsonMatch[0]);
      }
  
      fs.unlinkSync(pdfPath);
  
      res.json({ success: true, ...feedback });
  
    } catch (error) {
      console.error("CV Feedback Error:", error.message);
      res.status(500).json({ error: "Failed to analyze CV." });
    }
  });
module.exports = router;
