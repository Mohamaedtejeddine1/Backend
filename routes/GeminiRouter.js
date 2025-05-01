const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require("node-fetch");

global.fetch = fetch;
global.Headers = fetch.Headers;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/analyze", upload.single("cv"), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text;

    const prompt = `Analyze this CV and return a JSON-formatted analysis with these exact fields:
    {
      "languages": ["array", "of", "languages"],
      "technicalSkills": ["array", "of", "technical", "skills"],
      "softSkills": ["array", "of", "soft", "skills"],
      "desiredDomain": "string representing the candidate's desired job domain",
      "keyCompetencies": ["array", "of", "key", "competencies", "highlighted", "by", "the", "candidate"],
      "summary": "2-3 sentence summary text"
    }

    CV Content:
    ${extractedText}

    Return ONLY the JSON object, no additional text or explanation.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    let feedback = await result.response.text();

    try {
      feedback = JSON.parse(feedback.trim());
    } catch (e) {
      const jsonMatch = feedback.match(/\{[\s\S]*\}/);
      if (jsonMatch) feedback = JSON.parse(jsonMatch[0]);
    }

    fs.unlinkSync(pdfPath);

    res.json({ success: true, analysis: feedback });

  } catch (error) {
    console.error("CV Analysis Error:", error.message);
    res.status(500).json({ error: "Failed to analyze CV." });
  }
});

module.exports = router;