import express from "express";
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
  generateFlashcardsFromText,
  generateQuizFromText,
  smartPolishFlashcardsController,
  smartPolishQuizController,
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

// ✅ Generate flashcards from highlighted text
router.post(
  "/generate-flashcards-from-text",
  aiCache(
    "flashcardsFromText",
    (req) => `flashcardsFromText:${req.body.count || 2}:${req.body.text}`,
  ),
  generateFlashcardsFromText,
);

// ✅ Generate quiz questions
router.post("/generate-quiz", aiCache("quiz"), generateQuiz);

// ✅ Generate quiz from highlighted text
router.post(
  "/generate-quiz-from-text",
  aiCache(
    "quizFromText",
    (req) => `quizFromText:${req.body.numQuestions || 2}:${req.body.text}`,
  ),
  generateQuizFromText,
);

// ✅ Generate summary
router.post("/generate-summary", aiCache("summary"), generateSummary);

// ✅ Chat with AI
router.post("/chat", aiCache("chat"), chat);

// ✅ Explain a concept
router.post("/explain-concept", aiCache("concept"), explainConcept);


// ✅ Get chat history
router.get("/chat-history/:documentId", getChatHistory);

// ✅ Smart Polish
router.post("/smart-polish-flashcard", smartPolishFlashcardsController);
router.post("/smart-polish-quiz", smartPolishQuizController);

export default router;
