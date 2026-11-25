const express = require("express");
const router = express.Router();

const {
  registerEvent,
  getMyRegistrations,
  getAllRegistrations,
  getEventRegistrations,
  cancelRegistration,
} = require("../controllers/registrationController");

const {
  protect,
  adminOnly,
  studentOnly,
} = require("../middleware/authMiddleware");

// Student routes
router.post("/", protect, studentOnly, registerEvent);

router.get(
  "/my",
  protect,
  studentOnly,
  getMyRegistrations
);

router.patch(
  "/:id/cancel",
  protect,
  studentOnly,
  cancelRegistration
);

// Admin routes
router.get(
  "/admin",
  protect,
  adminOnly,
  getAllRegistrations
);

router.get(
  "/event/:id",
  protect,
  adminOnly,
  getEventRegistrations
);

module.exports = router;