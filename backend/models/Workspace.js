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
        "chat"
      ],

      required: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,

      required: true,

      // FIXED refPath
      refPath: "resources.model",
    },

    model: {
      type: String,

      enum: [
        "WorkspaceLesson",
        "Flashcard",
        "Quiz",
        "Document",
        "Note",
        "ChatHistory"
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
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

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
        "project"
      ],

      default: "lesson",
    },

    status: {
      type: String,

      enum: [
        "locked",
        "unlocked",
        "completed"
      ],

      default: "locked",
    },

    generationStatus: {
      type: String,

      enum: [
        "idle",
        "generating",
        "completed",
        "failed"
      ],

      default: "idle",
    },

    difficulty: {
      type: String,

      enum: [
        "easy",
        "medium",
        "hard"
      ],

      default: "easy",
    },

    estimatedTime: {
      type: Number,
      default: 15, // minutes
    },

    xpReward: {
      type: Number,
      default: 50,
    },

    aiPromptUsed: {
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

    resources: [resourceSchema],

    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],

    completedAt: Date,

    lastStudiedAt: Date,

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

    isGenerated: {
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true,
    },

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

    level: {
      type: String,

      enum: [
        "beginner",
        "intermediate",
        "advanced"
      ],

      default: "beginner",
    },

    learningStyle: {
      type: String,

      enum: [
        "visual",
        "practice",
        "reading",
        "interactive"
      ],

      default: "interactive",
    },

    language: {
      type: String,
      default: "en",
    },

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

    nodes: [nodeSchema],

    currentNodeIndex: {
      type: Number,
      default: 0,
    },

    totalXP: {
      type: Number,
      default: 0,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completedNodes: {
      type: Number,
      default: 0,
    },

    totalNodes: {
      type: Number,
      default: 0,
    },

    totalStudyTime: {
      type: Number,
      default: 0,
    },

    streakDays: {
      type: Number,
      default: 0,
    },

    lastStudiedAt: Date,

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