import User from "../models/User.js";
import Document from "../models/Document.js";
import Quiz from "../models/Quiz.js";
import Flashcard from "../models/Flashcard.js";
import Workspace from "../models/Workspace.js";

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDocuments = await Document.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalFlashcards = await Flashcard.countDocuments();
    const totalWorkspaces = await Workspace.countDocuments();

    // Flashcards and quizzes rendered from docs
    const flashcardsFromDocs = await Flashcard.countDocuments({ sourceType: 'document' });
    const quizzesFromDocs = await Quiz.countDocuments({ sourceType: 'document' });

    // Recent users (e.g., registered in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        newUsersThisWeek,
        totalDocuments,
        totalQuizzes,
        totalFlashcards,
        totalWorkspaces,
        flashcardsFromDocs,
        quizzesFromDocs
      },
    });
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get all users (with pagination & search)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional search by email or username
    const search = req.query.search ? {
      $or: [
        { email: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(search)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(search);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const userDocs = await Document.countDocuments({ userId: user._id });
    const userQuizzes = await Quiz.countDocuments({ userId: user._id });
    const userFlashcards = await Flashcard.countDocuments({ userId: user._id });

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          documents: userDocs,
          quizzes: userQuizzes,
          flashcards: userFlashcards
        }
      },
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Update user status (active/banned)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Prevent admin from banning themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: "You cannot ban yourself" });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in updateUserStatus:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: "You cannot change your own role" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get all recent content (Workspaces, Quizzes, Flashcards)
// @route   GET /api/admin/content
// @access  Private/Admin
export const getRecentContent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const documents = await Document.find().sort({ createdAt: -1 }).limit(limit).populate('userId', 'username email');
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).limit(limit).populate('userId', 'username email');
    const workspaces = await Workspace.find().sort({ createdAt: -1 }).limit(limit).populate('userId', 'username email');
    
    res.status(200).json({
      success: true,
      data: {
        documents,
        quizzes,
        workspaces
      }
    });
  } catch (error) {
    console.error("Error in getRecentContent:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Delete any content
// @route   DELETE /api/admin/content/:type/:id
// @access  Private/Admin
export const deleteContent = async (req, res) => {
  try {
    const { type, id } = req.params;
    let deleted;

    switch (type) {
      case 'document':
        deleted = await Document.findByIdAndDelete(id);
        break;
      case 'quiz':
        deleted = await Quiz.findByIdAndDelete(id);
        break;
      case 'flashcard':
        deleted = await Flashcard.findByIdAndDelete(id);
        break;
      case 'workspace':
        deleted = await Workspace.findByIdAndDelete(id);
        break;
      default:
        return res.status(400).json({ success: false, error: "Invalid content type" });
    }

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Content not found" });
    }

    res.status(200).json({ success: true, message: `${type} deleted successfully` });
  } catch (error) {
    console.error("Error in deleteContent:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
