import express from "express";
import protect from "../middleware/auth.js";
import {
  getAllQuizzes,
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
  restartQuiz,
  startQuiz,
  createManualQuiz,
  uploadFromSheetQuiz,
  downloadSheetTemplate,
} from "../controllers/quizController.js";
import { uploadSheet } from "../config/multerSheet.js";

const router = express.Router();

router.use(protect);
/**
 * ===============================
 * 📘 QUIZ ROUTES
 * ===============================
 */
router.post(
  "/upload-sheet",
  uploadSheet.single("file"), // 👈 field name phải là "file"
  uploadFromSheetQuiz,
);

router.get("/", getAllQuizzes);
/**
 * @route   GET /api/quizzes
 * @desc    Get all quizzes of current user
 * @access  Private
 */
router.get("/document/:documentId", getQuizzes);

router.get("/download-template", downloadSheetTemplate);
/**
 * @route   GET /api/quizzes/:quizId
 * @desc    Get quiz by ID (questions, options)
 * @access  Private
 */
router.get("/:id", getQuizById);

/**
 * @route   POST /api/quizzes/:quizId/submit
 * @desc    Submit quiz answers
 * @access  Private
 */
router.post("/:id/submit", submitQuiz);

/**
 * @route   GET /api/quizzes/:quizId/results
 * @desc    Get quiz results (score, answers, explanation)
 * @access  Private
 */

router.get("/:id/results", getQuizResults);

/**
 * @route   DELETE /api/quizzes/:quizId
 * @desc    Delete a quiz
 * @access  Private
 */
router.delete("/:id", deleteQuiz);

router.post("/manual", createManualQuiz);


router.post("/:id/start", startQuiz);
router.post("/:id/restart", restartQuiz);

export default router;
