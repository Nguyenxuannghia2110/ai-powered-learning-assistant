import Flashcard from "../models/Flashcard.js";
import { calculateMasteryProgressFL } from "../utils/calculateMasteryProgressFL.js";
import ExcelJS from "exceljs";
import fs from "fs";
// @desc    Get flashcards by document
// @route   GET /api/flashcards/:documentId
// @access  Private
export const getFlashcards = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId is required",
      });
    }

    const flashcards = await Flashcard.find({
      userId: req.user._id,
      documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all flashcard sets by user
// @route   GET /api/flashcards
// @access  Private
export const getFlashcardSet = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user._id,
      sourceType: { $in: ["manual", "sheet"] },
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmFlashcardFromSheet = async (req, res, next) => {
  try {
    let { title, cards } = req.body;

    if (!cards || cards.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No cards provided",
      });
    }

    const validCards = cards.filter(
      (c) => c.valid && c.question?.trim() && c.answer?.trim(),
    );

    if (validCards.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid cards",
      });
    }

    if (!title || !title.trim()) {
      title = validCards[0].question.slice(0, 30) || "Untitled Flashcards";
    }

    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      title: title.trim(),
      sourceType: "sheet",
      count: validCards.length,
      masteryProgress: 0,
      cards: validCards.map((c) => ({
        question: c.question.trim(),
        answer: c.answer.trim(),
        difficulty: c.difficulty || "medium",
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const previewFlashcardFromSheet = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "File is required",
      });
    }

    const filePath = req.file.path;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.worksheets[0];

    if (!sheet) {
      return res.status(400).json({
        success: false,
        error: "Sheet not found",
      });
    }

    const errors = [];
    const previewData = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const question = row.getCell(1).value?.toString().trim();
      const answer = row.getCell(2).value?.toString().trim();

      const difficultyRaw = row.getCell(3).value;

      const difficulty = difficultyRaw
        ? difficultyRaw.toString().toLowerCase()
        : "medium";

      let rowErrors = [];

      // ✅ validate
      if (!question) rowErrors.push("Missing question");
      if (!answer) rowErrors.push("Missing answer");

      if (!["easy", "medium", "hard"].includes(difficulty)) {
        rowErrors.push("Invalid difficulty");
      }

      const isValid = rowErrors.length === 0;

      if (!isValid) {
        errors.push({
          row: rowNumber,
          errors: rowErrors,
        });
      }

      previewData.push({
        question: question || "",
        answer: answer || "",
        difficulty,
        valid: isValid,
      });
    });

    // 🔥 cleanup file
    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      total: previewData.length,
      validCount: previewData.filter((c) => c.valid).length,
      errorCount: errors.length,
      preview: previewData,
      errors,
    });
  } catch (err) {
    next(err);
  }
};

export const downloadFlashcardTemplate = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();

    // 📄 Sheet chính
    const sheet = workbook.addWorksheet("Flashcard Template");

    sheet.columns = [
      { header: "question", key: "question", width: 40 },
      { header: "answer", key: "answer", width: 40 },
      { header: "difficulty", key: "difficulty", width: 15 },
    ];

    // 🔥 Style header
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // 🔥 Sample data
    sheet.addRow({
      question: "What is AI?",
      answer: "Artificial Intelligence",
      difficulty: "easy",
    });

    // 🔥 Dropdown validation
    for (let i = 2; i <= 200; i++) {
      sheet.getCell(`C${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"easy,medium,hard"'],
      };
    }

    // 📄 Instruction sheet (PRO UX)
    const instructionSheet = workbook.addWorksheet("Instructions");

    instructionSheet.addRow(["FLASHCARD TEMPLATE GUIDE"]);
    instructionSheet.addRow([]);
    instructionSheet.addRow(["- Fill 'question' and 'answer'"]);
    instructionSheet.addRow(["- Do not leave empty rows"]);
    instructionSheet.addRow(["- difficulty: easy | medium | hard"]);
    instructionSheet.addRow(["- Max 200 rows recommended"]);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="flashcard_template.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("🔥 TEMPLATE ERROR:", err);
    next(err);
  }
};
//POST /api/flashcards/manual
export const createManualFlashcard = async (req, res, next) => {
  try {
    let { title, cards, documentId, sourceType } = req.body;

    if (!cards || cards.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cards are required",
      });
    }

    // 🔥 Clean cards
    const cleanCards = cards.filter(
      (c) => c.question?.trim() && c.answer?.trim(),
    );

    if (cleanCards.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid cards",
      });
    }

    // 🔥 Auto title nếu không có
    if (!title || !title.trim()) {
      title = cleanCards[0].question.slice(0, 30) || "Untitled Flashcards";
    }

    const setPayload = {
      userId: req.user._id,
      title: title.trim(),
      sourceType: sourceType || "manual",
      count: cleanCards.length,
      masteryProgress: 0,
      cards: cleanCards.map((c) => ({
        question: c.question.trim(),
        answer: c.answer.trim(),
        difficulty: c.difficulty || "medium",
        reviewCount: 0,
        isStarred: false,
      })),
    };

    if (documentId) {
      setPayload.documentId = documentId;
    }

    const flashcardSet = await Flashcard.create(setPayload);

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Manual flashcard created",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review a flashcard in a set
// @route   PUT /api/flashcards/:cardId/review
// @access  Private
export const reviewFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set or card not found",
        statusCode: 404,
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      (card) => card._id.toString() === req.params.cardId,
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Card not found in set",
        statusCode: 404,
      });
    }

    /* =========================
       UPDATE REVIEW DATA
    ========================= */

    const card = flashcardSet.cards[cardIndex];

    card.lastReviewed = new Date();
    card.reviewCount += 1;

    /* =========================
       RECALCULATE MASTERY
    ========================= */

    flashcardSet.masteryProgress = calculateMasteryProgressFL(
      flashcardSet.cards,
    );

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      message: "Flashcard reviewed successfully",
      masteryProgress: flashcardSet.masteryProgress,
      data: flashcardSet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle star/unstar a flashcard
// @route   PUT /api/flashcards/:cardId/star
// @access  Private
export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set or card not found",
        statusCode: 404,
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      (card) => card._id.toString() === req.params.cardId,
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Card not found in set",
        statusCode: 404,
      });
    }

    // ✅ Toggle star
    flashcardSet.cards[cardIndex].isStarred =
      !flashcardSet.cards[cardIndex].isStarred;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      message: `Flashcard ${
        flashcardSet.cards[cardIndex].isStarred ? "starred" : "unstarred"
      }`,
      data: flashcardSet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete flashcard set
// @route   DELETE /api/flashcards/:id
// @access  Private
export const deleteFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
        statusCode: 404,
      });
    }

    // ✅ Delete document
    await flashcardSet.deleteOne();

    res.status(200).json({
      success: true,
      message: "Flashcard set deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add cards to a flashcard set
// @route   POST /api/flashcards/:id/add-cards
// @access  Private
export const addCardsToSet = async (req, res, next) => {
  try {
    const { cards } = req.body;

    if (!cards || cards.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cards are required",
      });
    }

    const cleanCards = cards.filter(
      (c) => c.question?.trim() && c.answer?.trim(),
    );

    if (cleanCards.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid cards",
      });
    }

    const flashcardSet = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
        statusCode: 404,
      });
    }

    const newCards = cleanCards.map((c) => ({
      question: c.question.trim(),
      answer: c.answer.trim(),
      difficulty: c.difficulty || "medium",
      reviewCount: 0,
      isStarred: false,
    }));

    flashcardSet.cards.push(...newCards);
    flashcardSet.count = flashcardSet.cards.length;
    flashcardSet.masteryProgress = calculateMasteryProgressFL(flashcardSet.cards);

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
      message: `${newCards.length} cards added successfully`,
    });
  } catch (error) {
    next(error);
  }
};
