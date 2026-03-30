import fs from "fs/promises";
import mongoose from "mongoose";

import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";

// @desc    Upload PDF document
// @route   POST /api/documents
// Upload document
export const uploadDocument = async (req, res, next) => {
  try {
    // Kiểm tra file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }

    const { title } = req.body;

    // Kiểm tra title
    if (!title) {
      // Xóa file đã upload nếu không có title
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    // Construct URL cho file
    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = encodeURI(
      `${baseUrl}/uploads/documents/${req.file.filename}`,
    );
    // Tạo document record trong DB
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl, // Lưu URL thay vì đường dẫn local
      fileSize: req.file.size,
      status: "processing",
    });

    // Xử lý PDF trong background
    processPDF(document._id, req.file.path).catch((err) => {
      console.error("PDF processing error: ", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in progress...",
    });
  } catch (error) {
    // Clean up file nếu có lỗi
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

const processPDF = async (documentId, filePath) => {
  try {
    console.log(`Start processing document ${documentId} at ${filePath}`);

    const { text } = await extractTextFromPDF(filePath);

    if (!text) {
      throw new Error("Extracted text is empty");
    }

    const chunks = chunkText(text, 500, 50);

    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks,
      status: "ready", // ✅ xử lý xong
    });

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(
      `Error processing document ${documentId} at ${filePath}:`,
      error.message,
    );

    // Nếu lỗi → set status = failed
    await Document.findByIdAndUpdate(documentId, { status: "failed" });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
// Get all documents of current user
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      // 1. Match by user
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
        },
      },

      // 2. Lookup flashcards
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcards",
        },
      },

      // 3. Lookup quizzes
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },

      // 4. Add computed fields
      {
        $addFields: {
          flashcardCount: { $size: "$flashcards" },
          quizCount: { $size: "$quizzes" },
        },
      },

      // 5. Project only required fields
      {
        $project: {
          extractedText: 0, // hide heavy field
          flashcardSets: 0,
          quizzes: 0,
          chunks: 0,
        },
      },
      {
        $sort: { uploadDate: -1 },
      },
    ]);

    // 6. Response
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document by ID
// @route   GET /api/documents/:id
// @access  Private

export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // ✅ Đếm số flashcards & quizzes liên quan
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    // ✅ Update lastAccessed
    document.lastAccessed = Date.now();
    await document.save();

    // ✅ Trả về dữ liệu kết hợp
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
// @desc    Delete document by ID
// @route   DELETE /api/documents/:id
// @access  Private

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // ✅ Xóa file vật lý
    await fs.unlink(document.filePath).catch(() => {});

    // ✅ Xóa document trong DB
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
