
const express = require("express");

const {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require("../controllers/notificationController");

const {
    protect,
    adminOnly,
    studentOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get notifications
router.get("/", protect, getNotifications);

// Create notification
router.post("/", protect, adminOnly, createNotification);

// Mark all as read
router.patch(
    "/read-all",
    protect,
    studentOnly,
    markAllAsRead
);

// Mark single notification as read
router.patch(
    "/:id/read",
    protect,
    studentOnly,
    markAsRead
);

// Delete notification
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteNotification
);

module.exports = router;
