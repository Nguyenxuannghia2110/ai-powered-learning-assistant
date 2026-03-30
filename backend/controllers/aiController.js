import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";
import { HttpStatusCode } from "axios";
import { hashText } from "../utils/hash.js";
import AiResponseCache from "../models/AiResponseCache.js";


export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;
    const countNumber = parseInt(count, 10);

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
      });
    }

    /* ================= CHECK FLASHCARDSET EXIST ================= */
    const existingSet = await Flashcard.findOne({
      userId: req.user._id,
      documentId,
      count: countNumber,
      sourceType: "document",
    });

    if (existingSet) {
      return res.status(200).json({
        success: true,
        data: existingSet,
        cached: true,
        message: "Flashcard set already exists",
      });
    }

    /* ================= DOCUMENT CHECK ================= */
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    /* ================= AI CACHE CHECK ================= */
    const questionHash = hashText(`flashcards:${countNumber}`);

    const cached = await AiResponseCache.findOne({
      userId: req.user._id,
      documentId,
      type: "flashcards",
      questionHash,
    });

    let cards;

    if (cached) {
      cards = cached.output.cards;
    } else {
      cards = await geminiService.generateFlashcards(
        document.extractedText,
        countNumber,
      );

      if (!cards || cards.length === 0) {
        return res.status(200).json({
          success: true,
          data: null,
          message: "No flashcards generated",k
        });
      }

      await AiResponseCache.create({
        userId: req.user._id,
        documentId,
        type: "flashcards",
        questionHash,
        input: {
          action: "generate-flashcards",
          count: countNumber,
        },
        output: { cards },
        provider: "gemini",
      });
    }

    /* ================= SAVE FLASHCARDSET ================= */
    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId,
      sourceType: "document",
      count: countNumber,
      masteryProgress: 0,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || "medium",
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(200).json({
      success: true,
      data: flashcardSet,
      cached: !!cached,
      message: cached
        ? "Flashcards loaded from cache"
        : "Flashcards generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 *    POST /api/ai/generate-quiz
 *    Generate quiz questions
 */
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions, title } = req.body;

    /* =====================================================
       0️⃣ VALIDATE INPUT
    ===================================================== */

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    // Chuẩn hóa số lượng câu hỏi
    let finalNumQuestions = parseInt(numQuestions);

    if (isNaN(finalNumQuestions)) finalNumQuestions = 5;

    // Giới hạn để tránh spam AI
    finalNumQuestions = Math.min(Math.max(finalNumQuestions, 1), 30);

    /* =====================================================
       1️⃣ CHECK DOCUMENT
    ===================================================== */

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    /* =====================================================
       2️⃣ TẠO HASH THEO INPUT
    ===================================================== */

    const questionHash = hashText(`quiz:${documentId}:${finalNumQuestions}`);

    /* =====================================================
       3️⃣ CHECK CACHE
    ===================================================== */

    let questions;

    const cached = await AiResponseCache.findOne({
      userId: req.user._id,
      documentId,
      type: "quiz",
      questionHash,
    });

    if (cached) {
      questions = cached.output.questions;
    } else {
      /* =====================================================
         4️⃣ CALL GEMINI
      ===================================================== */

      questions = await geminiService.generateQuiz(
        document.extractedText,
        finalNumQuestions,
      );

      if (!questions || questions.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "No quiz generated",
        });
      }

      /* =====================================================
         5️⃣ SAVE CACHE
      ===================================================== */

      await AiResponseCache.create({
        userId: req.user._id,
        documentId,
        type: "quiz",
        questionHash,
        input: `generate-quiz:${finalNumQuestions}`,
        output: { questions },
        provider: "gemini",
      });
    }

    /* =====================================================
       6️⃣ NORMALIZE QUESTIONS
    ===================================================== */

    const normalizedQuestions = questions.map((q, index) => {
      let correctIndex = q.correctAnswer;

      // Nếu AI trả text thay vì index
      if (typeof correctIndex === "string") {
        const foundIndex = q.options?.findIndex(
          (opt) =>
            opt.toLowerCase().trim() === correctIndex.toLowerCase().trim(),
        );
        correctIndex = foundIndex !== -1 ? foundIndex : 0;
      }

      if (isNaN(correctIndex)) correctIndex = 0;

      return {
        question: q.question || `Question ${index + 1}`,
        options: q.options?.slice(0, 4) || [
          "Option A",
          "Option B",
          "Option C",
          "Option D",
        ],
        correctAnswer: Number(correctIndex),
        explanation: q.explanation || "",
        difficulty: q.difficulty || "easy",
      };
    });

    /* =====================================================
       7️⃣ SAVE QUIZ TO DB
    ===================================================== */

    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: title || `${document.title} - Quiz`,
      questions: normalizedQuestions,
      totalQuestions: normalizedQuestions.length,
      score: null,
    });

    /* =====================================================
       8️⃣ RESPONSE
    ===================================================== */

    res.status(200).json({
      success: true,
      cached: !!cached,
      requestedQuestions: finalNumQuestions,
      actualQuestions: normalizedQuestions.length,
      data: quiz,
      message: cached
        ? "Quiz loaded from cache"
        : "Quiz generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 *    POST /api/ai/summary
 *    Generate document summary
 */
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    /* ================= 1️⃣ CHECK CACHE ================= */
    const cached = await AiResponseCache.findOne({
      userId: req.user._id,
      documentId,
      type: "summary",
    });

    let summaryContent;

    if (cached) {
      // ✅ LẤY TỪ CACHE
      summaryContent = cached.output.summary;
    } else {
      // ❌ CHƯA CÓ → GỌI GEMINI
      summaryContent = await geminiService.generateSummary(
        document.extractedText,
      );

      if (!summaryContent) {
        return res.status(200).json({
          success: true,
          data: {
            documentId: document._id,
            title: document.title,
            summary: "",
          },
          message: "No summary generated",
        });
      }

      /* ================= 2️⃣ SAVE CACHE ================= */
      await AiResponseCache.create({
        userId: req.user._id,
        documentId,
        type: "summary",
        input: "generate-summary",
        output: { summary: summaryContent },
        provider: "gemini",
      });
    }

    /* ================= 3️⃣ RESPONSE ================= */
    res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary: summaryContent,
      },
      cached: !!cached,
      message: cached
        ? "Summary loaded from cache"
        : "Summary generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 *    POST /api/ai/chat
 *     Chat with document context
 */

export const chat = async (req, res, next) => {
  try {
    const { documentId, question, chatHistoryId } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        error: "Document ID and question are required",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
      });
    }

    /* =====================================================
       1️⃣ FIND RELEVANT CHUNKS
    ===================================================== */
    let relevantChunks = findRelevantChunks(document.chunks, question, 8);
    const chunkIndices = relevantChunks.map((c) => c.chunkIndex ?? null);

    if (!relevantChunks.length) {
      relevantChunks = [
        {
          chunkIndex: null,
          content: document.extractedText.substring(0, 20000),
          score: 0,
        },
      ];
    }

    /* =====================================================
       2️⃣ LOAD / CREATE CHAT HISTORY
    ===================================================== */
    let chatHistory = null;

    if (chatHistoryId) {
      chatHistory = await ChatHistory.findOne({
        _id: chatHistoryId,
        userId: req.user._id,
        documentId: document._id,
      });
    }

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        documentId: document._id,
        messages: [],
      });
    }

    /* =====================================================
       3️⃣ CHECK CACHE
    ===================================================== */
    const questionHash = hashText(`chat:${documentId}:${question}`);

    let answer;
    let cached = false;

    const cachedResponse = await AiResponseCache.findOne({
      userId: req.user._id,
      documentId,
      type: "chat",
      questionHash,
    });

    if (cachedResponse) {
      answer = cachedResponse.output.answer;
      cached = true;
    } else {
      /* =====================================================
         4️⃣ CALL GEMINI
      ===================================================== */
      answer = await geminiService.chatWithContext(question, relevantChunks);

      // ⚠️ AI fail → không cache, vẫn trả
      if (!answer || answer.trim() === "") {
        answer = "⚠️ AI could not generate a response.";
      } else {
        /* =====================================================
           5️⃣ SAVE CACHE
        ===================================================== */
        await AiResponseCache.create({
          userId: req.user._id,
          documentId,
          type: "chat",
          questionHash,
          input: question,
          output: {
            answer,
            relevantChunks: chunkIndices,
          },
          provider: "gemini",
        });
      }
    }

    /* =====================================================
       6️⃣ SAVE CHAT HISTORY (BẮT BUỘC)
    ===================================================== */
    chatHistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      },
      {
        role: "assistant",
        content: answer, // ⚠️ luôn có content
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      },
    );

    await chatHistory.save();

    /* =====================================================
       7️⃣ RESPONSE
    ===================================================== */
    res.json({
      success: true,
      cached,
      data: {
        question,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: chatHistory._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/ai/explain
 * @desc    Explain concept using document
 */
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: "Document ID and concept are required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    /* =====================================================
       1️⃣ FIND RELEVANT CHUNKS
    ===================================================== */
    const relevantChunks = findRelevantChunks(document.chunks, concept, 8);
    const context = relevantChunks.map((c) => c.content).join("\n\n");

    /* =====================================================
       2️⃣ CREATE HASH KEY
    ===================================================== */
    const questionHash = hashText(`concept:${documentId}:${concept}`);

    /* =====================================================
       3️⃣ CHECK CACHE
    ===================================================== */
    let explanation;

    const cached = await AiResponseCache.findOne({
      userId: req.user._id,
      documentId,
      type: "concept",
      questionHash,
    });

    if (cached) {
      explanation = cached.output.explanation;
    } else {
      /* =====================================================
         4️⃣ CALL GEMINI
      ===================================================== */
      explanation = await geminiService.explainConcept(concept, context);

      // AI fail → không cache
      if (!explanation) {
        return res.status(200).json({
          success: true,
          data: {
            concept,
            explanation: "No explanation generated",
            relevantChunks: relevantChunks.map((c) => c.chunkIndex),
          },
          message: "No explanation generated",
        });
      }

      /* =====================================================
         5️⃣ SAVE CACHE
      ===================================================== */
      await AiResponseCache.create({
        userId: req.user._id,
        documentId,
        type: "concept",
        questionHash,
        input: concept,
        output: {
          explanation,
          relevantChunks: relevantChunks.map((c) => c.chunkIndex),
        },
        provider: "gemini",
      });
    }

    /* =====================================================
       6️⃣ RESPONSE
    ===================================================== */
    res.status(200).json({
      success: true,
      cached: !!cached,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map((c) => c.chunkIndex),
      },
      message: cached
        ? "Concept loaded from cache"
        : "Concept explained successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/ai/chat-history/:documentId
 * @desc    Get chat history for a document
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId,
    }).select("_id messages");

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: {
          chatHistoryId: null,
          messages: [],
        },
        message: "No chat history found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        chatHistoryId: chatHistory._id,
        messages: chatHistory.messages,
      },
      message: "Chat history retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
