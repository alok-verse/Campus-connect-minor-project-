const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");

const registrationSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      default: () => `CC-${randomUUID().toUpperCase()}`,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    status: {
      type: String,
      enum: ["registered", "cancelled", "attended"],
      default: "registered",
    },

    paymentStatus: {
      type: String,
      enum: ["free", "pending", "paid"],
      default: "free",
    },

    amount: {
      type: Number,
      min: 0,
      default: 0,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate registrations
registrationSchema.index(
  { studentId: 1, eventId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);