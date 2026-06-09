import User from "../models/User.js";
// @desc    Get all users with pagination, search, filter
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search by username or email
    const searchQuery = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    // Filter by status or role
    const filterQuery = {};
    if (req.query.status && req.query.status !== "all") {
      filterQuery.status = req.query.status;
    }
    if (req.query.role && req.query.role !== "all") {
      filterQuery.role = req.query.role;
    }
    if (req.query.subscription && req.query.subscription !== "all") {
      filterQuery.subscription = req.query.subscription;
    }

    const query = { ...searchQuery, ...filterQuery };

    // Sorting
    let sortQuery = { createdAt: -1 }; // default newest
    if (req.query.sortBy) {
      const order = req.query.sortOrder === "asc" ? 1 : -1;
      sortQuery = { [req.query.sortBy]: order };
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password, role, status, subscription } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      const duplicatedField = userExists.email === email ? "email" : "username";

      return res.status(400).json({
        success: false,
        message: `A user with this ${duplicatedField} already exists`,
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role || "user",
      status: status || "active",
      subscription: subscription || "Free"
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(400).json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.status = req.body.status || user.status;
      user.subscription = req.body.subscription || user.subscription;

      // Only update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          subscription: updatedUser.subscription
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(400).json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent deleting self (Optional: assuming req.user._id is the current admin)
      if (user._id.toString() === req.user._id.toString()) {
         return res.status(400).json({ success: false, message: "You cannot delete your own account" });
      }

      await User.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "User removed" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Update user status (Ban/Disable/Active)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["active", "banned"].includes(status)) {
       return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const user = await User.findById(req.params.id);
    if (user) {
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: "You cannot change your own status" });
      }

      user.status = status;
      await user.save();
      res.json({ success: true, message: `User status updated to ${status}` });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error in updateUserStatus:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Reset User Password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.params.id);
    if (user) {
      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: "Password reset successful" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error in resetUserPassword:", error);
    res.status(400).json({ success: false, message: error.message || "Server error" });
  }
};

// ==========================================
// CONTENT MANAGEMENT (Phase 3)
// ==========================================

import Document from "../models/Document.js";
import Quiz from "../models/Quiz.js";
import Flashcard from "../models/Flashcard.js";
import AiResponseCache from "../models/AiResponseCache.js";
import Workspace from "../models/Workspace.js";

// @desc    Get all documents
// @route   GET /api/admin/documents
export const getAllDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = req.query.search ? { title: { $regex: req.query.search, $options: "i" } } : {};

    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, data: { documents, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all quizzes
// @route   GET /api/admin/quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    const total = await Quiz.countDocuments(query);
    const quizzes = await Quiz.find(query)
      .populate('userId', 'username email')
      .populate('documentId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, data: { quizzes, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get AI logs
// @route   GET /api/admin/ai-logs
export const getAILogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await AiResponseCache.countDocuments();
    const logs = await AiResponseCache.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Provide some mock aggregate stats for the UI
    const stats = {
      totalRequests: total,
      failedRequests: 0,
      totalTokens: logs.reduce((acc, log) => acc + (log.promptTokens || 0) + (log.completionTokens || 0), 0)
    };

    res.json({ success: true, data: { logs, stats, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all flashcards
// @route   GET /api/admin/flashcards
export const getAllFlashcards = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    const total = await Flashcard.countDocuments(query);
    const flashcards = await Flashcard.find(query)
      .populate('userId', 'username email')
      .populate('documentId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, data: { flashcards, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all topics (Workspaces)
// @route   GET /api/admin/topics
export const getAllTopics = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = req.query.search
      ? {
          $or: [
            { topic: { $regex: req.query.search, $options: "i" } },
            { description: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const total = await Workspace.countDocuments(query);
    const topics = await Workspace.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, data: { topics, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete topic (Workspace)
// @route   DELETE /api/admin/topics/:id
export const deleteTopic = async (req, res) => {
  try {
    const topic = await Workspace.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    await topic.deleteOne();

    res.json({ success: true, message: "Topic deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete Document
// @route   DELETE /api/admin/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
    await doc.deleteOne();
    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete Quiz
// @route   DELETE /api/admin/quizzes/:id
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    await quiz.deleteOne();
    res.json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete Flashcard Set
// @route   DELETE /api/admin/flashcards/:id
export const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);
    if (!flashcard) return res.status(404).json({ success: false, message: "Flashcard not found" });
    await flashcard.deleteOne();
    res.json({ success: true, message: "Flashcard deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubs = await User.countDocuments({ subscription: { $ne: "Free" } });
    const totalDocs = await Document.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalFlashcards = await Flashcard.countDocuments();
    const totalAiRequests = await AiResponseCache.countDocuments();

    // Mock revenue data for now
    const revenueData = [
      { name: 'Jan', value: 4000 },
      { name: 'Feb', value: 3000 },
      { name: 'Mar', value: 5000 },
      { name: 'Apr', value: 4500 },
      { name: 'May', value: 6000 },
      { name: 'Jun', value: 5500 },
      { name: 'Jul', value: 7000 },
    ];

    // Mock AI usage data for now
    const aiUsageData = [
      { name: 'Mon', value: 120 },
      { name: 'Tue', value: 180 },
      { name: 'Wed', value: 150 },
      { name: 'Thu', value: 200 },
      { name: 'Fri', value: 250 },
      { name: 'Sat', value: 210 },
      { name: 'Sun', value: 190 },
    ];

    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubs,
        totalDocs,
        totalQuizzes,
        totalFlashcards,
        totalAiRequests,
        revenueData,
        aiUsageData
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
