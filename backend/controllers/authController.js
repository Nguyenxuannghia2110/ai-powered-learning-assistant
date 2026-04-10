import jwt from "jsonwebtoken";
import User from "../models/User.js";

//Generate JWT token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

// @desc    Register new user
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 🔍 Check user tồn tại
    const userExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message:
          userExists.email === email
            ? "Email already registered"
            : "Username already taken",
      });
    }

    // 🔒 Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // ✅ Tạo user
    const newUser = await User.create({
      username,
      email,
      password,
    });

    // 🔑 Generate tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // 💾 Lưu refresh token vào DB
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Register success",
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          profileImage: newUser.profileImage,
          createdAt: newUser.createdAt,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
//@desc login user --public post
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // ✅ Validate input

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: "Please provide email and password",
      });
    }
    // Check user tồn tại (include password)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: "Invalid email or password",
      });
    }
    //Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: "Invalid email or password",
      });
    }
    // 🔑 Generate token
    // 🔑 Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 💾 Lưu refresh token vào DB
    user.refreshToken = refreshToken;
    await user.save();
    // Response

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get profile // PUT /api/auth/profile
export const getProfile = async (req, res, next) => {
  try {
    // req.user được gán từ middleware protect
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

//@desc    Change user password
//@route   PUT /api/auth/change-password
//@access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // ✅ Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required",
        statusCode: 400,
      });
    }

    // ✅ Tìm user và lấy cả password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }

    // ✅ Kiểm tra mật khẩu hiện tại
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
        statusCode: 401,
      });
    }

    // ✅ Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save(); // pre('save') sẽ tự hash mật khẩu

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc    Update user profile
//@route   PUT /api/auth/profile
//@access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profileImage } = req.body;

    // tìm user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }

    // cập nhật nếu có gửi dữ liệu
    if (username) user.username = username;
    if (email) user.email = email;
    if (profileImage !== undefined) user.profileImage = profileImage;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      error: "No refresh token provided",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        error: "Invalid refresh token",
      });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    return res.status(403).json({
      error: "Refresh token expired or invalid",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await User.updateOne({ refreshToken }, { refreshToken: null });

    // ❌ XÓA cookie
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Logout failed",
    });
  }
};
