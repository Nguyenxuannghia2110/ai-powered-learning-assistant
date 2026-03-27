import express from "express";
import {
  getFlashcards,
  getAllFlashcardSet,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
} from "../controllers/flashcardController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// 📌 Lấy tất cả flashcards
router.get("/", getAllFlashcardSet);

// 📌 Lấy 1 flashcard theo ID
router.get("/:documentId", getFlashcards);

// 📌 Review flashcard (đánh dấu đã học / cập nhật trạng thái)
router.post("/:cardId/review", reviewFlashcard);

// 📌 Toggle star (đánh dấu sao)
router.put("/:cardId/star", toggleStarFlashcard);

// 📌 Xóa flashcard
router.delete("/:id", deleteFlashcardSet);

export default router;
