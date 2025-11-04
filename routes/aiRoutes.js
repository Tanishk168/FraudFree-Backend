const express = require("express");
const router = express.Router();
const axios = require("axios");
const Report = require('../models/Report'); // Import Report model for saving
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("inside aiRoutes.js")

router.get("/company-check", async (req, res) => {
  const companyName = decodeURIComponent(req.query.name || '');

  if (!companyName) {
    return res.status(400).json({ message: "Company name is required" });
  }

  const prompt = `
You are an AI investigator whose job is to search the internet and gather reliable, real-world information about a company.

Find out if the target company "${companyName}" has ever been involved in any negative activity such as scam reports, fraud allegations, non-payment of employees, abusive behavior, fake hiring, legal or police cases, regulatory penalties, or public controversies.

Search Rules:
- Search broadly using combinations such as: "${companyName} scam", "${companyName} fraud", "${companyName} complaint", "${companyName} FIR", "${companyName} not paying", "${companyName} harassment", "site:glassdoor.com ${companyName}", "site:reddit.com ${companyName}", "${companyName} Dehradun", etc.
- Include alternate spellings or spacing variants (e.g., Nova Nectar, NovaNectar, Nova-Nectar).
- Translate search terms into local languages (like Hindi) if the company is Indian or regionally based.
- Prefer credible evidence: news sites, official documents, verified reviews, and court records. Avoid unverified random posts unless no other data exists.
- Summarize clearly whether any credible malpractice or scam evidence exists, and if so, describe it briefly.
- If you find nothing solid, clearly mention that "no credible public reports or verified complaints were found" but only after you have tried multiple relevant search queries.
- Always double-check results to ensure the output matches the truth found online and not just generic text.

Always return exactly one review or finding in this exact JSON format (no arrays, no markdown):
{
  "companyName": "${companyName}",
  "city": "Mention the city if found, else 'Unknown'",
  "description": "Short summary of the fraud or issue found",
  "reportedBy": "AI Scan",
  "dateReported": "2025-06-28T00:00:00.000Z"
}

If no credible fraud is found after thorough searching, still return a review in the above format with a description indicating "no credible public reports or verified complaints were found".
`;

  try {
    console.log("inside try")
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const raw = response.data.candidates[0].content.parts[0].text;
    console.log("inside try2")
    // Extract JSON from markdown code block if present
    let jsonString = raw;
    if (raw.includes('```json')) {
      const jsonMatch = raw.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
    }
    const parsed = JSON.parse(jsonString);
    console.log("try completed")

    // Check if fraud is detected (i.e., parsed has companyName, not just message)
    if (parsed.companyName && parsed.description) {
      // Save to database
      const newReport = new Report({
        companyName: parsed.companyName,
        city: parsed.city || 'Unknown',
        description: parsed.description,
        reportedBy: parsed.reportedBy || 'AI Scan',
        dateReported: parsed.dateReported ? new Date(parsed.dateReported) : new Date(),
      });
      await newReport.save();
      console.log("Fraud report saved to DB");
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.log("inside catch")
    console.error("AI Company Report Error:", error);

    // Handle rate limiting (429) specifically
    if (error.response && error.response.status === 429) {
      return res.status(429).json({
        message: "AI search rate limit exceeded. Please try again in a few minutes.",
        error: "Rate limit exceeded"
      });
    }

    return res.status(500).json({ message: "AI report generation failed" });
  }
});

module.exports = router;






