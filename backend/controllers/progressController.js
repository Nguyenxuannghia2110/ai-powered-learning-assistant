import mongoose from "mongoose";
import Document from "../models/Document.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import FlashcardSet from "../models/Flashcard.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    /* ================= BASIC FETCH ================= */

    const [
      totalDocuments,
      totalFlashcardSets,
      flashcardSets,
      quizzes,
      chats,
      documents,
    ] = await Promise.all([
      Document.countDocuments({ userId }),
      FlashcardSet.countDocuments({ userId }),
      FlashcardSet.find({ userId }),
      Quiz.find({ userId }).populate("documentId", "title"),
      ChatHistory.find({ userId }),
      Document.find({ userId }).sort({ createdAt: -1 }).limit(5),
    ]);

    /* ================= FLASHCARD STATS ================= */

    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach((set) => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter((c) => c.reviewCount > 0).length;
      starredFlashcards += set.cards.filter((c) => c.isStarred).length;
    });

    /* ================= QUIZ STATS ================= */

    const completedQuizzes = quizzes.filter((q) => q.completedAt);
    const totalQuizzesCompleted = completedQuizzes.length;

    const averageQuizScore =
      completedQuizzes.length > 0
        ? Math.round(
            completedQuizzes.reduce((sum, q) => sum + q.score, 0) /
              completedQuizzes.length,
          )
        : 0;

    const completionRate =
      quizzes.length > 0
        ? Math.round((totalQuizzesCompleted / quizzes.length) * 100)
        : 0;

    /* ================= QUIZ TREND (GROUP BY DAY) ================= */

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const trendMap = {};

    completedQuizzes
      .filter((q) => new Date(q.completedAt) >= sevenDaysAgo)
      .forEach((q) => {
        const date = new Date(q.completedAt).toISOString().split("T")[0];

        if (!trendMap[date]) {
          trendMap[date] = [];
        }

        trendMap[date].push(q.score);
      });

    const quizTrend = Object.entries(trendMap).map(([date, scores]) => ({
      date,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));

    /* ================= STUDY STREAK (REAL CONSECUTIVE) ================= */

    const activityDates = new Set([
      ...completedQuizzes.map((q) => new Date(q.completedAt).toDateString()),
      ...chats.map((c) => new Date(c.updatedAt).toDateString()),
    ]);

    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dateStr = currentDate.toDateString();

      if (activityDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    const studyStreak = streak;

    /* ================= STUDY HOURS ================= */

    // YÊU CẦU: quiz phải có field duration (phút)
    const totalStudyMinutes = completedQuizzes.reduce(
      (sum, q) => sum + (q.duration || 0),
      0,
    );

    const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

    /* ================= TOPIC MASTERY (BY DOCUMENT) ================= */

    const topicMap = {};

    completedQuizzes.forEach((q) => {
      const topic = q.documentId?.title || "Unknown";

      if (!topicMap[topic]) {
        topicMap[topic] = [];
      }

      topicMap[topic].push(q.score);
    });

    let strongestTopic = null;
    let weakestTopic = null;

    Object.entries(topicMap).forEach(([topic, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

      if (!strongestTopic || avg > strongestTopic.avg) {
        strongestTopic = {
          topic,
          avg: Math.round(avg),
        };
      }

      if (!weakestTopic || avg < weakestTopic.avg) {
        weakestTopic = {
          topic,
          avg: Math.round(avg),
        };
      }
    });

    /* ================= ACTIVITY TIMELINE ================= */

    const activities = [
      ...documents.map((doc) => ({
        id: doc._id,
        type: "upload",
        title: `Uploaded "${doc.title}"`,
        createdAt: doc.createdAt,
      })),

      ...completedQuizzes.slice(0, 5).map((quiz) => ({
        id: quiz._id,
        type: "quiz",
        title: `Completed ${quiz.documentId?.title || "Quiz"}`,
        score: quiz.score,
        createdAt: quiz.completedAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    /* ================= RESPONSE ================= */

    res.json({
      success: true,
      data: {
        userName: req.user.name || "Student",

        weekProgress: completionRate,

        totalDocuments,
        totalFlashcards: totalFlashcardSets,
        totalCards: totalFlashcards,
        totalQuizzes: totalQuizzesCompleted,

        studyStreak,
        avgScore: averageQuizScore,
        totalStudyHours: Number(totalStudyHours),

        strongestTopic: strongestTopic
          ? {
              name: strongestTopic.topic,
              score: strongestTopic.avg,
            }
          : null,

        weakestTopic: weakestTopic
          ? {
              name: weakestTopic.topic,
              score: weakestTopic.avg,
            }
          : null,

        quizTrend,
        activities,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Dashboard error" });
  }
};
