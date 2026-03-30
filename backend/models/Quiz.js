import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sourceType: {
      type: String,
      enum: ["document", "manual", "sheet"],
      required: true,
    },

    // 🔥 FIX: không bắt buộc nữa
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // ===========================
    // QUESTIONS ARRAY (inline)
    // ===========================
    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        options: {
          type: [String],
          required: true,
          validate: [
            (array) => array.length === 4,
            "Must have exactly 4 options",
          ],
        },

        correctAnswer: {
          type: Number, // index của options[]
          required: true,
        },

        explanation: {
          type: String,
          default: "",
        },

        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "easy",
        },
      },
    ],

    // ===========================
    // USER ANSWERS ARRAY (inline)
    // ===========================
    userAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },

        selectedAnswer: {
          type: Number,
          required: true,
        },

        isCorrect: {
          type: Boolean,
          required: true,
        },

        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    score: {
      type: Number,
      default: null,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    timeSpent: {
      type: Number, // seconds
    },
  },

  { timestamps: true },
);

//index for faster queries
quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
