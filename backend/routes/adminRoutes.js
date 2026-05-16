import express from "express";
import protect from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getAdminStats,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  getRecentContent,
  deleteContent
} from "../controllers/adminController.js";

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(isAdmin);

// Dashboard stats
router.get("/stats", getAdminStats);

// User Management
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/status", updateUserStatus);
router.put("/users/:id/role", updateUserRole);

// Content Management
router.get("/content", getRecentContent);
router.delete("/content/:type/:id", deleteContent);

export default router;
