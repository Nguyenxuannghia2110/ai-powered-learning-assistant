import Quiz from "../models/Quiz.js";
import ExcelJS from "exceljs";
import fs from "fs";

/**
 * =====================================================
 * GET /api/quizzes
 * Get all quizzes of current user
 * =====================================================
 */
export const getAllQuizzes = async (req, res, next) => {
  try {
    const { sourceType, documentId } = req.query;

    let filter = {
      userId: req.user._id,
    };

    if (sourceType) {
      filter.sourceType = sourceType;
    }

    // 👉 chỉ filter document khi là doc
    if (sourceType === "document" && documentId) {
      filter.documentId = documentId;
    }

    const quizzes = await Quiz.find(filter)
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizzes = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    let filter = {
      userId: req.user._id,
      sourceType: "document", // ✅ chỉ lấy từ doc
    };

    // 👉 nếu có truyền documentId thì filter thêm
    if (documentId) {
      filter.documentId = documentId;
    }

    const quizzes = await Quiz.find(filter)
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * =====================================================
 * GET /api/quizzes/:quizId
 * Get quiz by ID (without answers)
 * =====================================================
 */
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

export const createManualQuiz = async (req, res, next) => {
  try {
    const { title, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Title and questions are required",
      });
    }

    // validate từng question
    const validQuestions = questions.map((q, index) => {
      if (!q.question || !q.options || q.options.length !== 4) {
        throw new Error(`Invalid question at index ${index}`);
      }

      return {
        question: q.question,
        options: q.options,
        correctAnswer: Number(q.correctAnswer) || 0,
        explanation: q.explanation || "",
        difficulty: q.difficulty || "easy",
      };
    });

    const quiz = await Quiz.create({
      userId: req.user._id,
      sourceType: "manual", // 🔥 QUAN TRỌNG
      title,
      questions: validQuestions,
      totalQuestions: validQuestions.length,
    });

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Manual quiz created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const downloadSheetTemplate = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Quiz Template");

    sheet.columns = [
      { header: "question", key: "question", width: 30 },
      { header: "option1", key: "option1", width: 20 },
      { header: "option2", key: "option2", width: 20 },
      { header: "option3", key: "option3", width: 20 },
      { header: "option4", key: "option4", width: 20 },
      { header: "correctAnswer", key: "correctAnswer", width: 15 },
      { header: "explanation", key: "explanation", width: 30 },
      { header: "difficulty", key: "difficulty", width: 15 },
    ];

    // 🔥 Style header
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // 🔥 Sample data
    sheet.addRow({
      question: "Apple nghĩa là gì?",
      option1: "Táo",
      option2: "Cam",
      option3: "Chuối",
      option4: "Nho",
      correctAnswer: 0,
      explanation: "Apple = Táo",
      difficulty: "easy",
    });

    // 🔥 Dropdown validation
    for (let i = 2; i <= 200; i++) {
      // correctAnswer
      sheet.getCell(`F${i}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"0,1,2,3"'],
      };

      // difficulty
      sheet.getCell(`G${i}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"easy,medium,hard"'],
      };
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="quiz_template.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

export const uploadFromSheetQuiz = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "File is required",
      });
    }

    const filePath = req.file.path; // ✅ FIX: dùng path

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
    const validQuestions = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const question = row.getCell(1).value?.toString().trim();

      const optionsRaw = [
        row.getCell(2).value,
        row.getCell(3).value,
        row.getCell(4).value,
        row.getCell(5).value,
      ];

      const correctAnswer = Number(row.getCell(6).value);

      const explanation = row.getCell(8).value?.toString() || "";
      const difficultyRaw = row.getCell(7).value;

      const difficulty = difficultyRaw
        ? difficultyRaw.toString().toLowerCase()
        : "easy";

      let rowErrors = [];

      // ✅ validate question
      if (!question) {
        rowErrors.push("Missing question");
      }

      // ✅ validate options
      const options = optionsRaw.map((opt) =>
        opt ? opt.toString().trim() : "",
      );

      if (options.some((opt) => !opt)) {
        rowErrors.push("Missing options");
      }

      // ✅ validate correctAnswer
      if (![0, 1, 2, 3].includes(correctAnswer)) {
        rowErrors.push("correctAnswer must be 0-3");
      }

      // ✅ validate difficulty
      if (!["easy", "medium", "hard"].includes(difficulty)) {
        rowErrors.push("Invalid difficulty");
      }

      // ✅ push result
      if (rowErrors.length > 0) {
        errors.push({
          row: rowNumber,
          errors: rowErrors,
        });
      } else {
        validQuestions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    });

    // (optional) xoá file sau khi đọc để tránh full disk
    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      validCount: validQuestions.length,
      errorCount: errors.length,
      preview: validQuestions,
      errors,
    });
  } catch (err) {
    next(err);
  }
};
/**
 * =====================================================
 * POST /api/quizzes/:quizId/submit
 * Submit quiz answers
 * =====================================================
 */
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Answers must be an array",
        statusCode: 400,
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    // 🚫 chống submit lại
    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz already submitted",
      });
    }

    // ❌ KHÔNG cho submit nếu chưa start
    if (!quiz.startedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz has not been started",
      });
    }

    let correctCount = 0;
    const userAnswers = [];

    answers.forEach((answer) => {
      const { questionIndex, selectedAnswer } = answer;

      if (
        typeof questionIndex === "number" &&
        questionIndex < quiz.questions.length
      ) {
        const question = quiz.questions[questionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;

        if (isCorrect) correctCount++;

        userAnswers.push({
          questionIndex,
          selectedAnswer,
          isCorrect,
          answeredAt: new Date(),
        });
      }
    });

    const score = Math.round((correctCount / quiz.totalQuestions) * 100);

    const completedAt = new Date();

    // 🔥 CHUẨN: chỉ dùng startedAt
    const timeSpent = Math.max(
      0,
      Math.floor((completedAt - new Date(quiz.startedAt)) / 1000),
    );

    // ✅ update
    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = completedAt;
    quiz.timeSpent = timeSpent;

    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalQuestions: quiz.totalQuestions,
        percentage: score,
        timeSpent,
        userAnswers,
      },
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const startQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz already completed",
      });
    }

    if (!quiz.startedAt) {
      quiz.startedAt = new Date();
      await quiz.save();
    }

    res.status(200).json({
      success: true,
      data: {
        startedAt: quiz.startedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const restartQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    quiz.userAnswers = [];
    quiz.score = null;
    quiz.completedAt = null;
    quiz.startedAt = null; // 🔥 QUAN TRỌNG
    quiz.timeSpent = 0;

    await quiz.save();

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * =====================================================
 * GET /api/quizzes/:quizId/results
 * Get quiz results
 * =====================================================
 */
export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz has not been submitted yet",
        statusCode: 400,
      });
    }
    //Build detailded resuilts
    const detaildedResults = quiz.questions.map((question, index) => {
      const userAnswer = quiz.userAnswers.find(
        (a) => a.questionIndex === index,
      );

      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        correctAnswerIndex: question.correctAnswer,
        selectedAnswerIndex: userAnswer?.selectedAnswer ?? null,
        // text (🔥 CÁI QUAN TRỌNG)
        correctAnswerText: question.options[question.correctAnswer],

        selectedAnswerText: userAnswer
          ? question.options[userAnswer.selectedAnswer]
          : null,

        isCorrect: userAnswer?.isCorrect || false,
        explanation: question.explanation,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          completedAt: quiz.completedAt,
          timeSpent: quiz.timeSpent, // 🔥 ADD THIS
        },
        results: detaildedResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =====================================================
 * DELETE /api/quizzes/:quizId
 * Delete quiz
 * =====================================================
 */
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
