const User = require("../models/User");
const jwt = require("jsonwebtoken");

const authController = {
  // @desc    Register user
  // @route   POST /api/auth/register
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
      });

      // Generate token
      const token = user.generateToken();

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      // Handle validation errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: messages.join(", "),
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error during registration",
        error: error.message
      });
    }
  },

  // @desc    Login user
  // @route   POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      // Find user by email and include password
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check password
      const isPasswordCorrect = await user.comparePassword(password);

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate token
      const token = user.generateToken();

      // Set cookie (optional)
      if (process.env.NODE_ENV === "production") {
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
        error: error.message
      });
    }
  },

  // @desc    Get current user
  // @route   GET /api/auth/me
  getMe: async (req, res) => {
    try {
      // User is already attached to req by auth middleware
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      console.error("Get me error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  // @desc    Update user profile
  // @route   PUT /api/auth/profile
  updateProfile: async (req, res) => {
    try {
      const { name, email } = req.body;

      // Build update object
      const updateData = {};
      if (name) updateData.name = name;
      if (email) {
        // Check if email is already taken
        const existingUser = await User.findOne({
          email,
          _id: { $ne: req.user.id },
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already in use",
          });
        }
        updateData.email = email;
      }

      // Update user
      const user = await User.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: messages.join(", "),
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  // @desc    Change password
  // @route   POST /api/auth/change-password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Please provide current and new password",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }

      // Get user with password
      const user = await User.findById(req.user.id);

      // Check current password
      const isPasswordCorrect = await user.comparePassword(currentPassword);

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  // @desc    Logout user
  // @route   POST /api/auth/logout
  logout: async (req, res) => {
    try {
      // Clear cookie if using cookies
      res.clearCookie("token");

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  // @desc    Get all users (admin only)
  // @route   GET /api/auth/users
  getUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password");

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  // @desc    Delete user (admin only)
  // @route   DELETE /api/auth/users/:id
  deleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent admin from deleting themselves
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }

      await user.deleteOne();

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
};

module.exports = authController;
