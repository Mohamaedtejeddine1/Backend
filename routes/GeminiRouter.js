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
router.post("/generateInterviewQuestions", async (req, res) => {
  try {
    const { jobTitle, candidateSummary } = req.body;

    if (!jobTitle || !candidateSummary) {
      return res.status(400).json({ message: 'Job title and candidate summary are required' });
    }

    // Strong prompt to generate numbered questions (one per line)
    const prompt = `
You are an expert recruiter.

Generate 4 just 4 relevant interview questions for the following job and candidate.

Format your response exactly as a numbered list with each question on a new line, like this:
1. First question?
2. Second question?
...

Job Title: ${jobTitle}

Candidate Summary: ${candidateSummary}

Interview Questions:
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    // Get raw text response from Gemini
    let responseText = await result.response.text();

    // Clean text: trim whitespace
    responseText = responseText.trim();

    // Split response by newline to get each question as a separate line
    let lines = responseText.split('\n');

    // Filter out empty or whitespace-only lines
    lines = lines.filter(line => line.trim() !== '');

    // Map lines to remove leading numbering like "1. " or "2. "
    const questions = lines.map(line => {
      return line.replace(/^\d+\.\s*/, '').trim();
    });

    // Respond with structured JSON containing array of questions
    res.status(200).json({
      questions: questions
    });

  } catch (error) {
    console.error('Error generating interview questions:', error);
    res.status(500).json({ message: 'Failed to generate interview questions' });
  }
});

module.exports = router;

module.exports = router;