import mongoose from "mongoose";

const AiResponseCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["summary", "flashcards", "quiz", "chat", "concept"],
      required: true,
      index: true,
    },

    // Hash của câu hỏi / concept / input
    questionHash: {
      type: String,
      index: true,
      default: null,
    },

    // Text input đã normalize (để debug)
    input: {
      type: mongoose.Schema.Types.Mixed, 
      required: true,
    },

    // Output AI (summary | quiz | flashcards | answer)
    output: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    provider: {
      type: String,
      default: "gemini",
    },
  },
  { timestamps: true },
);

/**
 * Mỗi document + type + question chỉ cache 1 lần
 * - summary: questionHash = null
 * - chat / concept: questionHash != null
 */
AiResponseCacheSchema.index(
  { userId: 1, documentId: 1, type: 1, questionHash: 1 },
  { unique: true, sparse: true },
);

export default mongoose.model("AiResponseCache", AiResponseCacheSchema);
