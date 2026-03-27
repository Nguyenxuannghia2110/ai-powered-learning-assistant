import Quiz from "../models/Quiz.js";

/**
 * =====================================================
 * GET /api/quizzes
 * Get all quizzes of current user
 * =====================================================
 */
export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
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
    });

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
