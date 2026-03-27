import express from "express";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import protect from "../middleware/auth.js";
import { upload } from "../config/multer.js"; // ✅ import Multer


const router = express.Router();

// ✅ All routes are protected
router.use(protect);

// @route   POST /api/documents/upload
// @desc    Upload document
router.post("/upload", upload.single("file"), uploadDocument); // ⚡ route upload

// @route   GET /api/documents
// @desc    Get all documents of user
router.get("/", getDocuments);

// @route   GET /api/documents/:id
// @desc    Get single document
router.get("/:id", getDocument);

// @route   DELETE /api/documents/:id
// @desc    Delete document
router.delete("/:id", deleteDocument);



export default router;
