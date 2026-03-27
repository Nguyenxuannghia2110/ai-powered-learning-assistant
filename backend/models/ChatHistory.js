import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    // ======================================
    // 💬 Lịch sử hội thoại AI
    // ======================================
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },

        content: {
          type: String,
          required: true,
        },

        timestamp: {
          type: Date,
          default: Date.now,
        },

        // 🔎 Các chunk liên quan trong RAG
        relevantChunks: {
          type: [Number], // Danh sách index chunk
          default: [],
        },
      },
    ],
  },

  {
    timestamps: true, // add createdAt, updatedAt
  }
);

// ⚡ Tối ưu truy vấn theo user + document (1 user - 1 document - 1 history)
chatHistorySchema.index({ userId: 1, documentId: 1 });

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
export default ChatHistory;
