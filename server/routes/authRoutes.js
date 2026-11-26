
const express = require("express");

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

// Login
router.post("/login", login);

// Get authenticated user
router.get("/me", protect, getMe);

// Update student profile
router.patch("/profile", protect, studentOnly, updateProfile);

module.exports = router;
