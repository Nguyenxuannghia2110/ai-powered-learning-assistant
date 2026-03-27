import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: null,
    },

    // hasdf

    count: {
      type: Number,
      required: true,
    },

    masteryProgress: {
      type: Number,
      default: 0,
    },
    sourceType: {
  type: String,
  enum: ["document", "manual", "sheet"],
  default: "document",
},

    // ====================================
    // ⚡ FLASHCARD LIST
    // ====================================
    cards: [
      {
        question: {
          type: String,
          required: true,
        },

        answer: {
          type: String,
          required: true,
        },

        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },

        lastReviewed: {
          type: Date,
          default: null,
        },

        reviewCount: {
          type: Number,
          default: 0,
        },

        isStarred: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },

  { timestamps: true },
);

flashcardSchema.index(
  { userId: 1, documentId: 1},
  {
    unique: true,
    partialFilterExpression: {
      documentId: { $type: "objectId" },
    },
  }
);

const Flashcard = mongoose.model("Flashcard", flashcardSchema);
export default Flashcard;
