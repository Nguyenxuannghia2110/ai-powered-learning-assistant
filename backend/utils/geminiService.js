import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/* ================= CONFIG ================= */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/* ================= UTILITIES ================= */

// Check API key
const validateApiKey = () => {
  if (!GEMINI_API_KEY) {
    throw new Error("❌ GEMINI_API_KEY is missing in environment variables");
  }
};

// Split long text into smaller chunks
export const chunkText = (text, chunkSize = 2000) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.substring(start, start + chunkSize));
    start += chunkSize;
  }

  return chunks;
};

// Delay function for retry
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Safe JSON parser for messy AI output
const safeJsonParse = (rawText) => {
  try {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (error) {
    console.error("⚠️ JSON parse failed:", error.message);
    return null;
  }
};

/* ============================================================
   CORE GEMINI REQUEST HANDLER (REST API fallback)
============================================================ */

const geminiRequest = async (prompt, retryCount = 2) => {
  validateApiKey();

  const url = `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) throw new Error("Empty Gemini response");

    return text;
  } catch (error) {
    console.error(
      "❌ Gemini API error:",
      error.response?.data || error.message,
    );

    if (retryCount > 0) {
      console.log(`🔁 Retrying Gemini call... (${retryCount})`);
      await delay(1000);
      return geminiRequest(prompt, retryCount - 1);
    }

    return "";
  }
};

/* ================= FLASHCARDS ================= */

/**
 * Generate flashcards from text
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `
Generate exactly ${count} educational flashcards from the following text.

Format:
Q: Question
A: Answer
D: easy | medium | hard

Separate each flashcard with ---

Text:
${text.substring(0, 15000)}
`;

  try {
    const generatedText = await geminiRequest(prompt);
    if (!generatedText) return [];

    const flashcards = [];

    const cards = generatedText
      .split("---")
      .map((c) => c.trim())
      .filter(Boolean);

    for (const card of cards) {
      const lines = card.split("\n");

      let question = "";
      let answer = "";
      let difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) question = line.slice(2).trim();
        if (line.startsWith("A:")) answer = line.slice(2).trim();
        if (line.startsWith("D:")) {
          const d = line.slice(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(d)) {
            difficulty = d;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini flashcard error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/* ================= QUIZ ================= */

export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `
Generate exactly ${numQuestions} multiple choice questions.

Format:
Q: Question
01: Option A
02: Option B
03: Option C
04: Option D
C: Correct option (exact text)
E: Explanation
D: easy | medium | hard

Separate with ---

Text:
${text.substring(0, 15000)}
`;

  try {
    const generatedText = await geminiRequest(prompt);
    if (!generatedText) return [];

    const questions = [];

    const blocks = generatedText
      .split("---")
      .map((b) => b.trim())
      .filter(Boolean);

    for (const block of blocks) {
      const lines = block.split("\n");

      let question = "";
      let options = [];
      let correctAnswer = "";
      let explanation = "";
      let difficulty = "medium";

      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith("Q:")) question = t.slice(2).trim();
        else if (/^0\d:/.test(t)) options.push(t.slice(3).trim());
        else if (t.startsWith("C:")) correctAnswer = t.slice(2).trim();
        else if (t.startsWith("E:")) explanation = t.slice(2).trim();
        else if (t.startsWith("D:")) {
          const d = t.slice(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(d)) difficulty = d;
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini quiz error:", error);
    throw new Error("Failed to generate quiz");
  }
};

/* ================= SUMMARY ================= */

export const generateSummary = async (text) => {
  const prompt = `
Summarize the following text.
Detect the language of the document automatically.
Respond in the SAME language as the original text.
Do NOT translate.

${text.substring(0, 20000)}
`;
  try {
    const generatedText = await geminiRequest(prompt);
    return generatedText.trim();
  } catch (error) {
    console.error("Gemini summary error:", error);
    throw new Error("Failed to generate summary");
  }
};

/* ================= CHAT ================= */

export const chatWithContext = async (question, chunks) => {
  const contextText = chunks.map((c) => c.content || "").join("\n\n");

  const prompt = `
You are an AI learning assistant helping a student understand a document.

Use the provided context to answer the question clearly and naturally.
You may paraphrase, summarize, or explain in your own words.
If the answer is only partially available, explain based on what is present.
If the answer is not found at all, say clearly that the document does not provide this information.

Rules:
- Do NOT mention chunk numbers
- Do NOT say "based on the context" repeatedly
- Do NOT fabricate information
- Prefer explanation over short factual answers

Context:
${contextText}

Question:
${question}

Answer:
`;

  try {
    const generatedText = await geminiRequest(prompt);
    return generatedText.trim();
  } catch (error) {
    console.error("Gemini chat error:", error);
    throw new Error("Failed to chat with context");
  }
};

/* ================= EXPLAIN ================= */

export const explainConcept = async (concept, context) => {
  const prompt = `
Explain the concept "${concept}" using the context.

Context:
${context.substring(0, 10000)}
`;

  try {
    const generatedText = await geminiRequest(prompt);
    return generatedText.trim();
  } catch (error) {
    console.error("Gemini explain error:", error);
    throw new Error("Failed to explain concept");
  }
};
