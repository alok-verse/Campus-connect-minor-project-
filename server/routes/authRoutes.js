
const express = require("express");
const { rateLimit } = require("express-rate-limit");

const {
    login,
    getMe,
    updateProfile
} = require("../controllers/authController");

const {
    protect,
    studentOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// Login rate limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    }
});

// Login
router.post("/login", loginLimiter, login);

// Get authenticated user
router.get("/me", protect, getMe);

// Update student profile
router.patch("/profile", protect, studentOnly, updateProfile);

module.exports = router;
