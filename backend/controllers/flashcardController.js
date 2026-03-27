import Flashcard from "../models/Flashcard.js";
import { calculateMasteryProgressFL } from "../utils/calculateMasteryProgressFL.js";
// @desc    Get flashcards by document
// @route   GET /api/flashcards/:documentId
// @access  Private
export const getFlashcards = async (req, res, next) => {
  try {
    const { type, documentId } = req.query;

    const query = {
      userId: req.user._id,
    };

    if (type) {
      query.sourceType = type;
    }

    if (documentId) {
      query.documentId = documentId;
    }

    const flashcards = await Flashcard.find(query)
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

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
export const getAllFlashcardSet = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user._id,
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

//POST /api/flashcards/sheet
export const createFlashcardFromSheet = async (req, res, next) => {
  try {
    const { title, rows } = req.body;

    // rows: [{ question, answer }]
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Sheet data is required",
      });
    }

    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      title,
      sourceType: "sheet",
      count: rows.length,
      masteryProgress: 0,
      cards: rows.map((row) => ({
        question: row.question,
        answer: row.answer,
        difficulty: "medium",
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcard created from sheet",
    });
  } catch (error) {
    next(error);
  }
};
//POST /api/flashcards/manual
export const createManualFlashcard = async (req, res, next) => {
  try {
    const { title, cards } = req.body;

    if (!cards || cards.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cards are required",
      });
    }

    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      title,
      sourceType: "manual",
      count: cards.length,
      masteryProgress: 0,
      cards: cards.map((c) => ({
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty || "medium",
        reviewCount: 0,
        isStarred: false,
      })),
    });

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
