// models/Workspace.js

import mongoose from "mongoose";

/**
 * =========================================================
 * RESOURCE SCHEMA
 * =========================================================
 */

const resourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,

      enum: [
        "lesson",
        "flashcard",
        "quiz",
        "note",
        "document",
        "video",
        "exercise",
        "chat",
      ],

      required: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,

      required: true,

      // FIXED
      refPath: "model",
    },

    model: {
      type: String,

      enum: [
        "WorkspaceLesson",
        "Flashcard",
        "Quiz",
        "Document",
        "Note",
        "ChatHistory",
      ],

      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: false,
  }
);

/**
 * =========================================================
 * NODE SCHEMA
 * =========================================================
 */

const nodeSchema = new mongoose.Schema(
  {
    /**
     * =====================================================
     * BASIC INFO
     * =====================================================
     */

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
    },

    keywords: [
      {
        type: String,
        trim: true,
      },
    ],

    /**
     * =====================================================
     * LEARNING FLOW
     * =====================================================
     */

    order: {
      type: Number,
      required: true,
    },

    type: {
      type: String,

      enum: [
        "lesson",
        "practice",
        "quiz",
        "revision",
        "project",
      ],

      default: "lesson",
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

    estimatedTime: {
      type: Number,
      default: 15,
    },

    xpReward: {
      type: Number,
      default: 50,
    },

    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],

    /**
     * =====================================================
     * STATUS
     * =====================================================
     */

    status: {
      type: String,

      enum: [
        "locked",
        "unlocked",
        "completed",
      ],

      default: "locked",
    },

    generationStatus: {
      type: String,

      enum: [
        "idle",
        "generating",
        "completed",
        "failed",
      ],

      default: "idle",
    },

    isGenerated: {
      type: Boolean,
      default: false,
    },

    completedAt: Date,

    lastStudiedAt: Date,

    /**
     * =====================================================
     * LEARNING ANALYTICS
     * =====================================================
     */

    studyCount: {
      type: Number,
      default: 0,
    },

    masteryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completionProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /**
     * =====================================================
     * AI
     * =====================================================
     */

    aiPromptUsed: {
      type: String,
      default: "",
    },

    generatedBy: {
      type: String,

      enum: [
        "gemini",
        "openai",
      ],

      default: "gemini",
    },

    /**
     * =====================================================
     * UI
     * =====================================================
     */

    icon: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    /**
     * =====================================================
     * QUICK RESOURCE REFERENCES
     * =====================================================
     */

    lessonResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkspaceLesson",
    },

    flashcardResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flashcard",
    },

    quizResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },

    /**
     * =====================================================
     * RESOURCE SYSTEM
     * =====================================================
     */

    resources: [resourceSchema],

    /**
     * =====================================================
     * SYSTEM
     * =====================================================
     */

    version: {
      type: Number,
      default: 1,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================================
 * WORKSPACE SCHEMA
 * =========================================================
 */

const workspaceSchema = new mongoose.Schema(
  {
    /**
     * =====================================================
     * OWNER
     * =====================================================
     */

    userId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true,
    },

    /**
     * =====================================================
     * BASIC INFO
     * =====================================================
     */

    topic: {
      type: String,

      required: true,

      trim: true,
    },

    goal: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    slug: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * =====================================================
     * LEARNING SETTINGS
     * =====================================================
     */

    level: {
      type: String,

      enum: [
        "beginner",
        "intermediate",
        "advanced",
      ],

      default: "beginner",
    },

    learningStyle: {
      type: String,

      enum: [
        "visual",
        "practice",
        "reading",
        "interactive",
      ],

      default: "interactive",
    },

    language: {
      type: String,

      enum: [
        "en",
        "vi",
        "jp",
      ],

      default: "en",
    },

    /**
     * =====================================================
     * UI
     * =====================================================
     */

    coverImage: {
      type: String,
      default: "",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    /**
     * =====================================================
     * ROADMAP
     * =====================================================
     */

    nodes: [nodeSchema],

    currentNodeIndex: {
      type: Number,
      default: 0,
    },

    completedNodes: {
      type: Number,
      default: 0,
    },

    totalNodes: {
      type: Number,
      default: 0,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /**
     * =====================================================
     * GAMIFICATION
     * =====================================================
     */

    totalXP: {
      type: Number,
      default: 0,
    },

    streakDays: {
      type: Number,
      default: 0,
    },

    totalStudyTime: {
      type: Number,
      default: 0,
    },

    /**
     * =====================================================
     * ACTIVITY
     * =====================================================
     */

    lastStudiedAt: Date,

    /**
     * =====================================================
     * VISIBILITY
     * =====================================================
     */

    isPublic: {
      type: Boolean,
      default: false,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
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

workspaceSchema.index({
  userId: 1,
  updatedAt: -1,
});

workspaceSchema.index({
  topic: "text",
  description: "text",
  tags: "text",
});

/**
 * =========================================================
 * MODEL
 * =========================================================
 */

const Workspace = mongoose.model(
  "Workspace",
  workspaceSchema
);

export default Workspace;