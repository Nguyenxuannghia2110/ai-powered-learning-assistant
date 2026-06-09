import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetUserPassword
} from "../controllers/adminController.js";
import protect from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// All routes here are protected and require admin privileges
router.use(protect, isAdmin);

// User Management Routes
router.route("/users")
  .get(getAllUsers)
  .post(createUser);

router.route("/users/:id")
  .put(updateUser)
  .delete(deleteUser);

router.patch("/users/:id/status", updateUserStatus);
router.post("/users/:id/reset-password", resetUserPassword);

// Content Management Routes
import { 
  getAllDocuments, 
  getAllQuizzes, 
  getAILogs,
  getAllFlashcards,
  getAllTopics,
  deleteTopic,
  deleteDocument,
  deleteQuiz,
  deleteFlashcard,
  getDashboardStats
} from "../controllers/adminController.js";

router.get("/dashboard/stats", getDashboardStats);

router.get("/documents", getAllDocuments);
router.delete("/documents/:id", deleteDocument);

router.get("/quizzes", getAllQuizzes);
router.delete("/quizzes/:id", deleteQuiz);

router.get("/flashcards", getAllFlashcards);
router.delete("/flashcards/:id", deleteFlashcard);

router.get("/topics", getAllTopics);
router.delete("/topics/:id", deleteTopic);

router.get("/ai-logs", getAILogs);

export default router;
