// utils/cvAnalysis.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

async function analyzeCV(cvBuffer, jobRequirements) {
  try {
    // Extract text from PDF
    const pdfData = await pdfParse(cvBuffer);
    const cvText = pdfData.text;

    // Simple prompt for Gemini
    const prompt = `
      Compare this CV with the job requirements and give a matching score.
      Job Title: ${jobRequirements.titre}
      Required Skills: ${jobRequirements.competance}
      
      CV Content:
      ${cvText}
      Respond ONLY with this JSON format:
      {
        "score": 0-100,
        "matchedSkills": [],
        "missingSkills": []
      }
    `;
    
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    return JSON.parse(response);
  } catch (error) {
    console.error("CV analysis error:", error);
    return { score: 0, matchedSkills: [], missingSkills: [] };
  }
}

module.exports = { analyzeCV };