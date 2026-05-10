// models/WorkspaceLesson.js

import mongoose from "mongoose";

const workspaceLessonSchema =
  new mongoose.Schema(
    {
      /**
       * =====================================================
       * RELATIONS
       * =====================================================
       */

      workspaceId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Workspace",

        required: true,

        index: true,
      },

      nodeId: {
        type:
          mongoose.Schema.Types.ObjectId,

        required: true,

        index: true,
      },

      /**
       * =====================================================
       * CONTENT
       * =====================================================
       */

      title: {
        type: String,

        required: true,

        trim: true,
      },

      content: {
        type: String,

        required: true,
      },

      summary: {
        type: String,

        default: "",
      },

      /**
       * =====================================================
       * AI
       * =====================================================
       */

      aiModel: {
        type: String,

        default: "gemini",
      },

      generationPrompt: {
        type: String,

        default: "",
      },

      generationStatus: {
        type: String,

        enum: [
          "completed",
          "failed",
        ],

        default: "completed",
      },

      /**
       * =====================================================
       * LEARNING
       * =====================================================
       */

      estimatedReadTime: {
        type: Number,

        default: 5,
      },

      difficulty: {
        type: String,

        enum: [
          "easy",
          "medium",
          "hard",
        ],

        default: "easy",
      },

      keywords: [
        {
          type: String,
        },
      ],

      /**
       * =====================================================
       * USER ACTIVITY
       * =====================================================
       */

      isBookmarked: {
        type: Boolean,

        default: false,
      },

      viewCount: {
        type: Number,

        default: 0,
      },

      lastViewedAt: Date,
    },
    {
      timestamps: true,
    }
  );

/**
 * =========================================================
 * INDEXES
 * =========================================================
 */

workspaceLessonSchema.index({
  workspaceId: 1,
  nodeId: 1,
});

workspaceLessonSchema.index({
  createdAt: -1,
});

/**
 * =========================================================
 * MODEL
 * =========================================================
 */

const WorkspaceLesson = mongoose.model(
  "WorkspaceLesson",
  workspaceLessonSchema
);

export default WorkspaceLesson;