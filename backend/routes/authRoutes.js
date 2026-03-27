import express from "express";
import { body } from "express-validator";

import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshAccessToken,
  logout,
} from "../controllers/authController.js";

import protect from "../middleware/auth.js";

const router = express.Router();

// ================= VALIDATION =================

// Register validation
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Login validation
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

// Change password validation
const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// Refresh token validation
const refreshTokenValidation = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

// ================= PUBLIC =================

router.post("/register", registerValidation, register);

router.post("/login", loginValidation, login);

// ================= PROTECTED =================

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  changePassword,
);

// 🔁 refresh token
router.post("/refresh-token", refreshTokenValidation, refreshAccessToken);

// 🚪 logout
router.post("/logout", protect, logout);

export default router;
