import { GoogleGenAI } from "@google/genai";
import { ApiError } from "../utils/ApiError.js";

let client = null;

const getClient = () => {
  const apikey = process.env.GEMINI_API_KEY;
  if (!apikey) {
    throw new ApiError(
      503,
      "Gemini API key is not configured, ADD GEMINI_API_KEY to backend .env file",
    );
  }
  if (!client) client = new GoogleGenAI({ apiKey: apikey });
  return client;
};

const MODEL = () => process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export const isAIConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const AI_TIMEOUT_MS = 25000;

const generateJSON = async (prompt, schema) => {
  const ai = getClient();
  let timeoutId;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    const response = await ai.models.generateContent({
      model: MODEL(),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.6,
      },
    });
    clearTimeout(timeoutId);
    return JSON.parse(response.text);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new ApiError(504, "AI request timed out. Please try again.");
    }
    console.error("Gemini JSON error:", err?.message || err);
    throw new ApiError(502, "AI request failed. Please try again in a moment");
  }
};

const generateText = async (prompt, temparature = 0.7) => {
  const ai = getClient();
  let timeoutId;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    const response = await ai.models.generateContent({
      model: MODEL(),
      contents: prompt,
      config: {
        temperature: temparature,
      },
    });
    clearTimeout(timeoutId);
    return response.text.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new ApiError(504, "AI request timed out. Please try again.");
    }
    console.error("Gemini JSON error:", err?.message || err);
    throw new ApiError(502, "AI request failed. Please try again in a moment");
  }
};

export const generateLeadSummary = async (lead) => {
  const prompt = `You are an expert B2B sales analyst for a CRM called Clario. Analyse the following sales lead and produce lead and produce a concise assessment.
Lead details:
-Name:${lead.name || "N/A"}
-Company:${lead.company || "N/A"}
-Email:${lead.email || "N/A"}
-Current Pipeline stage:${lead.status || "New"}
-Potential dead value:${lead.value || 0}
-Source:${lead.source || "Unknown"}
-Notes:${lead.notes || "None"}

return JSON only.
`;

  const schema = {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "2-3 sentence executive summary of the lead",
      },
      riskScore: {
        type: "integer",
        description: "Risk of losing its deal,0 {safe} to 100 {high risk}",
      },
      suggestedPriority: {
        type: "string",
        enum: ["Low", "Medium", "High"],
      },
      nextBestAction: {
        type: "string",
        description: "One concrete recemmonded next step",
      },
    },
    required: ["summary", "riskScore", "suggestedPriority", "nextBestAction"],
  };
  return generateJSON(prompt, schema);
};

export const generateEmail = async (lead, purpose, tone, sender) => {
  const prompt = `
You are a senior sales representative writing on behalf of
${sender?.name || "Our team"}${sender?.company ? ` at ${sender.company}` : ""}.

write a professional sales email.
- Purpose: ${lead?.name || "follow-up"}
- Desired tone: ${tone || "friendly and professional"}

Receipent (lead) details:
- Name: ${lead?.name || "N/A"}
- Company: ${lead?.company || "N/A"}
- Email: ${lead?.email || "N/A"}
- Pipeline Stage: ${lead?.status || "New"}
- Context Notes: ${lead?.notes || "None"}


Return valid JSON only, with a compelling subject line and a complete email body.
Use line breaks {\\n} in the body . Keep it under 100 words . Sign off as 
${sender?.name || "The Clario CRM Team"}
`;

  const schema = {
    type: "object",
    properties: {
      subject: { type: "string" },
      body: { type: "string" },
    },
    required: ["subject", "body"],
  };

  return generateJSON(prompt, schema);
};

export const generateSalesInsights = async (pipelineStats) => {
  const prompt = `You are a revenue-operations advisor,Given this snapshot of a sales pipeline, identify what is working, what is at risk,and concrete actions to improve conversion

Pipeline snapshot (JSON:
${JSON.stringify(pipelineStats, null, 2)}

return JSON only.
`;

  const schema = {
    type: "object",
    properties: {
      headline: {
        type: "string",
        description: "One sentence  summary of pipeline health",
      },
      insights: {
        type: "array",
        description: "3-5 Specific data driven observations",
        items: { type: "string" },
      },
      recommendations: {
        type: "array",
        description: "3-5 Actionable Recommenations",
        items: { type: "string" },
      },
      healthScore: {
        type: "integer",
        description: "Overall pipeline health 0-100",
      },
    },
    required: ["headline", "insights", "recommendations", "healthScore"],
  };
  return generateJSON(prompt, schema);
};

export { generateText };
