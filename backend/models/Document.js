import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    // ================================
    // 📝 Nội dung extract từ PDF/DOC dsaf
    // ================================
    extractedText: {
      type: String,
      default: "",
    },

    // ================================
    // 🔹 Chunks lưu vector hóa hoặc chia nhỏ text
    // ================================
    chunks: [
      {
        content: { type: String, required: true },

        pageNumber: {
          type: Number,
          default: 0,
        },

        chunkIndex: {
          type: Number,
          required: true,
        },
      },
    ],

    // ================================
    // 📅 Timestamp tự quản lý
    // ================================
    uploadDate: {
      type: Date,
      default: Date.now,
    },

    lastAccessed: {
      type: Date,
      default: Date.now, // chuẩn hơn Date.now
    },

    // ================================
    // 📌 status: processing | ready | failed
    // ================================
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
  },

  { timestamps: true }
);

// Index tối ưu query (userId + uploadDate)
documentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.model("Document", documentSchema);
export default Document;
