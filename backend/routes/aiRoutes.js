import express from "express";
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
} from "../controllers/aiController.js";

import protect from "../middleware/auth.js";
import { aiCache } from "../middleware/aiCache.js";

const router = express.Router();
router.use(protect);

// ✅ Generate flashcards from document
router.post(
  "/generate-flashcards",
  aiCache(
    "flashcards",
    (req) => `flashcards:${req.body.documentId}:${req.body.count || 10}`,
  ),
  generateFlashcards,
);

// ✅ Generate quiz questions
router.post("/generate-quiz", aiCache("quiz"), generateQuiz);

// ✅ Generate summary
router.post("/generate-summary", aiCache("summary"), generateSummary);

// ✅ Chat with AI
router.post("/chat", aiCache("chat"), chat);

// ✅ Explain a concept
router.post("/explain-concept", aiCache("concept"), explainConcept);

// ✅ Get chat history
router.get("/chat-history/:documentId", getChatHistory);

export default router;
