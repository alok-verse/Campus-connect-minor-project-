const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEventById,
  getAdminEvents,
  createEvent,
  updateEvent,
  archiveEvent,
  deleteEvent,
} = require("../controllers/eventController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Public routes
router.get("/", getEvents);

// Admin routes
router.get("/admin", protect, adminOnly, getAdminEvents);

router.post("/", protect, adminOnly, createEvent);

router.put("/:id", protect, adminOnly, updateEvent);

router.patch("/:id/archive", protect, adminOnly, archiveEvent);

router.delete("/:id", protect, adminOnly, deleteEvent);

// Public event details
router.get("/:id", getEventById);

module.exports = router;