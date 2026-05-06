// routes/workspaceRoutes.js

import express from "express";

import protect from "../middleware/auth.js";

import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,

  generateNodeContent,
  getNodeLesson,
  completeNode,

  updateWorkspace,
  deleteWorkspace,

  resetWorkspaceProgress,
} from "../controllers/workspaceController.js";

const router = express.Router();

/**
 * =========================================================
 * PROTECTED ROUTES
 * =========================================================
 */

router.use(protect);

/**
 * =========================================================
 * WORKSPACE ROUTES
 * =========================================================
 */

/**
 * ---------------------------------------------------------
 * CREATE WORKSPACE
 * GET ALL WORKSPACES
 * ---------------------------------------------------------
 */

router
  .route("/")
  .post(createWorkspace)
  .get(getWorkspaces);

/**
 * ---------------------------------------------------------
 * GET WORKSPACE
 * UPDATE WORKSPACE
 * DELETE WORKSPACE
 * ---------------------------------------------------------
 */

router
  .route("/:id")
  .get(getWorkspaceById)
  .put(updateWorkspace)
  .delete(deleteWorkspace);

/**
 * =========================================================
 * NODE ROUTES
 * =========================================================
 */

/**
 * ---------------------------------------------------------
 * GENERATE NODE CONTENT
 * ---------------------------------------------------------
 *
 * Generate:
 * - Lesson
 * - Flashcards
 * - Quiz
 */

router.post(
  "/:id/nodes/:nodeId/generate",
  generateNodeContent
);

/**
 * ---------------------------------------------------------
 * GET NODE LESSON
 * ---------------------------------------------------------
 */

router.get(
  "/:id/nodes/:nodeId/lesson",
  getNodeLesson
);

/**
 * ---------------------------------------------------------
 * COMPLETE NODE
 * ---------------------------------------------------------
 *
 * - Complete node
 * - Unlock next node
 * - Update XP
 * - Update progress
 */

router.post(
  "/:id/nodes/:nodeId/complete",
  completeNode
);

/**
 * =========================================================
 * WORKSPACE PROGRESS
 * =========================================================
 */

/**
 * ---------------------------------------------------------
 * RESET WORKSPACE PROGRESS
 * ---------------------------------------------------------
 */

router.post(
  "/:id/reset-progress",
  resetWorkspaceProgress
);

export default router;