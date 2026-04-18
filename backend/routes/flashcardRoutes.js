import express from "express";
import {
  getFlashcards,
  getFlashcardSet,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
  previewFlashcardFromSheet,
  confirmFlashcardFromSheet,
  createManualFlashcard,
  downloadFlashcardTemplate,
  addCardsToSet,
} from "../controllers/flashcardController.js";

import protect from "../middleware/auth.js";
import { uploadSheet } from "../config/multerSheet.js";

const router = express.Router();

router.use(protect);

// ✅ STATIC FIRST
router.get("/template", downloadFlashcardTemplate);
router.post("/preview", uploadSheet.single("file"), previewFlashcardFromSheet);
router.post("/confirm", confirmFlashcardFromSheet);
router.post("/manual", createManualFlashcard);

// ✅ ACTION
router.post("/:id/add-cards", addCardsToSet);
router.post("/:cardId/review", reviewFlashcard);
router.put("/:cardId/star", toggleStarFlashcard);
router.delete("/:id", deleteFlashcardSet);

// ✅ GET ALL (phải trước dynamic)
router.get("/", getFlashcardSet);

// ❗ ALWAYS LAST (cuối cùng luôn)
router.get("/:documentId", getFlashcards);

export default router;
