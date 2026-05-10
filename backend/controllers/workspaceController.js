// controllers/workspaceController.js

import mongoose from "mongoose";

import Workspace from "../models/Workspace.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import WorkspaceLesson from "../models/WorkspaceLesson.js";

import * as geminiService from "../utils/geminiService.js";

/**
 * =========================================================
 * CREATE WORKSPACE
 * =========================================================
 */

export const createWorkspace = async (
  req,
  res,
  next
) => {
  try {
    const {
      topic,
      goal,
      level,
      learningStyle,
      language,
    } = req.body;

    if (!topic?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Topic is required",
      });
    }

    /**
     * =========================================================
     * GENERATE ROADMAP
     * =========================================================
     */

    const roadmapSteps =
      await geminiService.generateRoadmap(
        topic,
        goal
      );

    if (!roadmapSteps?.length) {
      return res.status(500).json({
        success: false,
        error:
          "AI failed to generate roadmap",
      });
    }

    /**
     * =========================================================
     * BUILD NODES
     * =========================================================
     */

    const nodes = roadmapSteps.map(
      (step, index) => ({
        title:
          step.title ||
          `Step ${index + 1}`,

        description:
          step.description || "",

        order: index + 1,

        type: step.type || "lesson",

        difficulty:
          step.difficulty || "easy",

        estimatedTime:
          step.estimatedTime || 15,

        keywords:
          step.keywords || [],

        status:
          index === 0
            ? "unlocked"
            : "locked",

        generationStatus: "idle",

        isGenerated: false,

        xpReward: 50,
      })
    );

    /**
     * =========================================================
     * CREATE WORKSPACE
     * =========================================================
     */

    const workspace =
      await Workspace.create({
        userId: req.user._id,

        topic,

        goal: goal || "",

        description: `Learning path for ${topic}`,

        level:
          level || "beginner",

        learningStyle:
          learningStyle ||
          "interactive",

        language: language || "en",

        nodes,

        totalNodes: nodes.length,

        progress: 0,

        completedNodes: 0,

        currentNodeIndex: 0,

        totalXP: 0,
      });

    return res.status(201).json({
      success: true,

      message:
        "Workspace created successfully",

      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * GET ALL WORKSPACES
 * =========================================================
 */

export const getWorkspaces = async (
  req,
  res,
  next
) => {
  try {
    const workspaces =
      await Workspace.find({
        userId: req.user._id,

        isArchived: false,
      })
        .select(
          `
        topic
        goal
        progress
        totalXP
        completedNodes
        totalNodes
        level
        language
        updatedAt
        createdAt
      `
        )
        .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,

      count: workspaces.length,

      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * GET WORKSPACE BY ID
 * =========================================================
 */

export const getWorkspaceById = async (
  req,
  res,
  next
) => {
  try {
    const workspace =
      await Workspace.findOne({
        _id: req.params.id,

        userId: req.user._id,
      });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * GENERATE NODE LESSON CONTENT
 * =========================================================
 */
export const generateNodeLessonContent = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const workspace = await Workspace.findOne({ _id: req.params.id, userId: req.user._id }).session(session);
        if (!workspace) { await session.abortTransaction(); return res.status(404).json({ success: false, error: "Workspace not found" }); }
        
        const node = workspace.nodes.id(req.params.nodeId);
        if (!node) { await session.abortTransaction(); return res.status(404).json({ success: false, error: "Node not found" }); }

        if (node.generationStatus === "generating") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, error: "Node is already generating" });
        }

        node.generationStatus = "generating";
        await workspace.save({ session });

        const lessonContent = await geminiService.generateLessonNode(workspace.topic, node.title, node.description);
        if (!lessonContent) throw new Error("Failed to generate lesson");

        const lesson = await WorkspaceLesson.create([{
            workspaceId: workspace._id,
            nodeId: node._id,
            title: node.title,
            content: lessonContent,
            summary: node.summary || "",
        }], { session });

        node.resources = node.resources.filter(r => r.type !== "lesson");
        node.resources.push({
            type: "lesson",
            resourceId: lesson[0]._id,
            model: "WorkspaceLesson",
            title: `${node.title} Lesson`,
        });

        await workspace.save({ session });
        await session.commitTransaction();
        return res.status(200).json({ success: true, message: "Lesson generated successfully", data: node });
    } catch (error) {
        await session.abortTransaction();
        try { await Workspace.updateOne({ _id: req.params.id, "nodes._id": req.params.nodeId }, { $set: { "nodes.$.generationStatus": "failed" } }); } catch (e) {}
        next(error);
    } finally {
        session.endSession();
    }
};

/**
 * =========================================================
 * GENERATE NODE FLASHCARDS CONTENT
 * =========================================================
 */
export const generateNodeFlashcardsContent = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const workspace = await Workspace.findOne({ _id: req.params.id, userId: req.user._id }).session(session);
        if (!workspace) { await session.abortTransaction(); return res.status(404).json({ success: false, error: "Workspace not found" }); }
        
        const node = workspace.nodes.id(req.params.nodeId);
        if (!node) { await session.abortTransaction(); return res.status(404).json({ success: false, error: "Node not found" }); }

        const lessonResource = node.resources.find(r => r.type === "lesson");
        if (!lessonResource) { await session.abortTransaction(); return res.status(400).json({ success: false, error: "Lesson must be generated first" }); }

        const lesson = await WorkspaceLesson.findById(lessonResource.resourceId).session(session);
        if (!lesson) { await session.abortTransaction(); return res.status(404).json({ success: false, error: "Lesson not found" }); }

        node.generationStatus = "generating";
        await workspace.save({ session });

        const cards = await geminiService.generateFlashcards(lesson.content, 5);

        if (cards?.length) {
            const flashcardSet = await Flashcard.create([{
                userId: req.user._id,
                sourceType: "topic_learning",
                title: `${node.title} - Flashcards`,
                count: cards.length,
                masteryProgress: 0,
                cards: cards.map(card => ({
                    question: card.question,
                    answer: card.answer,
                    difficulty: card.difficulty || "medium",
                    reviewCount: 0,
                    isStarred: false,
                }))
            }], { session });

            node.resources = node.resources.filter(r => r.type !== "flashcard");
            node.resources.push({
                type: "flashcard",
                resourceId: flashcardSet[0]._id,
                model: "Flashcard",
                title: `${node.title} Flashcards`,
            });
        }

        await workspace.save({ session });
        await session.commitTransaction();
        return res.status(200).json({ success: true, message: "Flashcards generated successfully", data: node });
    } catch (error) {
        await session.abortTransaction();
        try { await Workspace.updateOne({ _id: req.params.id, "nodes._id": req.params.nodeId }, { $set: { "nodes.$.generationStatus": "failed" } }); } catch (e) {}
        next(error);
    } finally {
        session.endSession();
    }
};

/**
 * =========================================================
 * GENERATE NODE QUIZ CONTENT
 * =========================================================
 */
export const generateNodeQuizContent = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const workspace = await Workspace.findOne({ _id: req.params.id, userId: req.user._id }).session(session);
        if (!workspace) { await session.abortTransaction(); return res.status(404).json({ success: false, error: "Workspace not found" }); }
        
        const node = workspace.nodes.id(req.params.nodeId);
        if (!node) { await session.abortTransaction(); return res.status(404).json({ success: false, error: "Node not found" }); }

        const lessonResource = node.resources.find(r => r.type === "lesson");
        if (!lessonResource) { await session.abortTransaction(); return res.status(400).json({ success: false, error: "Lesson must be generated first" }); }

        const lesson = await WorkspaceLesson.findById(lessonResource.resourceId).session(session);
        if (!lesson) { await session.abortTransaction(); return res.status(404).json({ success: false, error: "Lesson not found" }); }

        node.generationStatus = "generating";
        await workspace.save({ session });

        const questions = await geminiService.generateQuiz(lesson.content, 3);

        if (questions?.length) {
            const normalizedQuestions = questions.map((q, index) => {
                let correctIndex = q.correctAnswer;
                if (typeof correctIndex === "string") {
                    const foundIndex = q.options?.findIndex(opt => opt.toLowerCase().trim() === correctIndex.toLowerCase().trim());
                    correctIndex = foundIndex !== -1 ? foundIndex : 0;
                }
                if (isNaN(correctIndex)) correctIndex = 0;

                return {
                    question: q.question || `Question ${index + 1}`,
                    options: q.options?.slice(0, 4) || ["A", "B", "C", "D"],
                    correctAnswer: Number(correctIndex),
                    explanation: q.explanation || "",
                    difficulty: q.difficulty || "medium",
                };
            });

            const quizSet = await Quiz.create([{
                userId: req.user._id,
                sourceType: "topic_learning",
                title: `${node.title} - Quiz`,
                questions: normalizedQuestions,
                totalQuestions: normalizedQuestions.length,
                score: null,
            }], { session });

            node.resources = node.resources.filter(r => r.type !== "quiz");
            node.resources.push({
                type: "quiz",
                resourceId: quizSet[0]._id,
                model: "Quiz",
                title: `${node.title} Quiz`,
            });
        }

        node.isGenerated = true;
        node.generationStatus = "completed";
        await workspace.save({ session });
        await session.commitTransaction();

        return res.status(200).json({ success: true, message: "Quiz generated successfully", data: node });
    } catch (error) {
        await session.abortTransaction();
        try { await Workspace.updateOne({ _id: req.params.id, "nodes._id": req.params.nodeId }, { $set: { "nodes.$.generationStatus": "failed" } }); } catch (e) {}
        next(error);
    } finally {
        session.endSession();
    }
};

/**
 * =========================================================
 * GET NODE LESSON
 * =========================================================
 */

export const getNodeLesson = async (
  req,
  res,
  next
) => {
  try {
    const workspace =
      await Workspace.findOne({
        _id: req.params.id,

        userId: req.user._id,
      });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    const node =
      workspace.nodes.id(
        req.params.nodeId
      );

    if (!node) {
      return res.status(404).json({
        success: false,
        error: "Node not found",
      });
    }

    const lessonResource =
      node.resources.find(
        (r) =>
          r.type === "lesson"
      );

    if (!lessonResource) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    const lesson =
      await WorkspaceLesson.findById(
        lessonResource.resourceId
      );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson content not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * COMPLETE NODE
 * =========================================================
 */

export const completeNode = async (
  req,
  res,
  next
) => {
  try {
    const workspace =
      await Workspace.findOne({
        _id: req.params.id,

        userId: req.user._id,
      });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    const node =
      workspace.nodes.id(
        req.params.nodeId
      );

    if (!node) {
      return res.status(404).json({
        success: false,
        error: "Node not found",
      });
    }

    if (
      node.status ===
      "completed"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Node already completed",
      });
    }

    /**
     * =====================================================
     * COMPLETE NODE
     * =====================================================
     */

    node.status = "completed";

    node.completedAt =
      new Date();

    node.lastStudiedAt =
      new Date();

    node.studyCount += 1;

    node.masteryScore = 100;

    /**
     * =====================================================
     * UNLOCK NEXT NODE
     * =====================================================
     */

    const nextNode =
      workspace.nodes.find(
        (n) =>
          n.order ===
          node.order + 1
      );

    if (
      nextNode &&
      nextNode.status ===
        "locked"
    ) {
      nextNode.status =
        "unlocked";
    }

    /**
     * =====================================================
     * UPDATE PROGRESS
     * =====================================================
     */

    const completedNodes =
      workspace.nodes.filter(
        (n) =>
          n.status ===
          "completed"
      ).length;

    workspace.completedNodes =
      completedNodes;

    workspace.progress =
      Math.round(
        (completedNodes /
          workspace.totalNodes) *
          100
      );

    workspace.currentNodeIndex =
      completedNodes;

    workspace.totalXP +=
      node.xpReward || 0;

    workspace.lastStudiedAt =
      new Date();

    await workspace.save();

    return res.status(200).json({
      success: true,

      message:
        "Node completed successfully",

      data: {
        progress:
          workspace.progress,

        totalXP:
          workspace.totalXP,

        unlockedNode:
          nextNode || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * UPDATE WORKSPACE
 * =========================================================
 */

export const updateWorkspace =
  async (req, res, next) => {
    try {
      const workspace =
        await Workspace.findOne({
          _id: req.params.id,

          userId:
            req.user._id,
        });

      if (!workspace) {
        return res.status(404).json({
          success: false,
          error:
            "Workspace not found",
        });
      }

      const allowedFields = [
        "topic",
        "goal",
        "description",
        "level",
        "learningStyle",
        "language",
        "coverImage",
        "tags",
        "isPublic",
      ];

      allowedFields.forEach(
        (field) => {
          if (
            req.body[field] !==
            undefined
          ) {
            workspace[field] =
              req.body[field];
          }
        }
      );

      await workspace.save();

      return res.status(200).json({
        success: true,

        message:
          "Workspace updated successfully",

        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * =========================================================
 * DELETE WORKSPACE
 * =========================================================
 */

export const deleteWorkspace =
  async (req, res, next) => {
    try {
      const workspace =
        await Workspace.findOne({
          _id: req.params.id,

          userId:
            req.user._id,
        });

      if (!workspace) {
        return res.status(404).json({
          success: false,
          error:
            "Workspace not found",
        });
      }

      /**
       * =====================================================
       * DELETE LESSONS
       * =====================================================
       */

      await WorkspaceLesson.deleteMany({
        workspaceId:
          workspace._id,
      });

      /**
       * =====================================================
       * DELETE FLASHCARDS & QUIZZES
       * =====================================================
       */

      const flashcardIds = [];
      const quizIds = [];

      workspace.nodes.forEach(
        (node) => {
          node.resources.forEach(
            (resource) => {
              if (
                resource.type ===
                "flashcard"
              ) {
                flashcardIds.push(
                  resource.resourceId
                );
              }

              if (
                resource.type ===
                "quiz"
              ) {
                quizIds.push(
                  resource.resourceId
                );
              }
            }
          );
        }
      );

      if (flashcardIds.length) {
        await Flashcard.deleteMany({
          _id: {
            $in: flashcardIds,
          },
        });
      }

      if (quizIds.length) {
        await Quiz.deleteMany({
          _id: {
            $in: quizIds,
          },
        });
      }

      /**
       * =====================================================
       * DELETE WORKSPACE
       * =====================================================
       */

      await workspace.deleteOne();

      return res.status(200).json({
        success: true,

        message:
          "Workspace deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * =========================================================
 * RESET WORKSPACE PROGRESS
 * =========================================================
 */

export const resetWorkspaceProgress =
  async (req, res, next) => {
    try {
      const workspace =
        await Workspace.findOne({
          _id: req.params.id,

          userId:
            req.user._id,
        });

      if (!workspace) {
        return res.status(404).json({
          success: false,
          error:
            "Workspace not found",
        });
      }

      workspace.progress = 0;

      workspace.completedNodes = 0;

      workspace.totalXP = 0;

      workspace.currentNodeIndex = 0;

      workspace.nodes.forEach(
        (node, index) => {
          node.status =
            index === 0
              ? "unlocked"
              : "locked";

          node.completedAt =
            null;

          node.lastStudiedAt =
            null;

          node.studyCount = 0;

          node.masteryScore = 0;
        }
      );

      await workspace.save();

      return res.status(200).json({
        success: true,

        message:
          "Workspace progress reset successfully",

        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  };