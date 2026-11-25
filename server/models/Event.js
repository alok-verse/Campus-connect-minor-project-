
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({

    // Organizer details
    organizer: {
        type: String,
        required: true,
        trim: true
    },

    phone: { type: String, default: "" },
    email: { type: String, default: "", trim: true },

    college: {
        type: String,
        default: "Sarala Birla University"
    },

    // Event details
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80
    },

    description: {
        type: String,
        required: true,
        maxlength: 1000
    },

    category: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    venue: {
        type: String,
        required: true
    },

    mode: {
        type: String,
        enum: ["Online", "Offline", "Hybrid"],
        default: "Offline"
    },

    icon: { type: String, default: "🎓" },

    // Registration schedule
    registrationStartDate: { type: Date },
    registrationDeadline: { type: Date },

    capacity: {
        type: Number,
        min: 1,
        default: 100
    },

    // Eligibility
    audience: {
        type: String,
        enum: ["All Students", "Specific Batch"],
        default: "All Students"
    },

    specificYear: {
        type: String,
        default: "",
        required: function () {
            return this.audience === "Specific Batch";
        }
    },

    // Additional information
    highlights: {
        type: String,
        default: "",
        maxlength: 600
    },

    instructions: {
        type: String,
        default: "",
        maxlength: 500
    },

    dressCode: { type: String, default: "" },

    // Payment details
    fee: {
        type: Number,
        min: 0,
        default: 0
    },

    payment: {
        type: String,
        enum: ["Online", "Offline", "Both"],
        default: "Both"
    },

    qrName: { type: String, default: "" },

    qrData: {
        type: String,
        default: "",
        maxlength: 1000000
    },

    // Event banner
    bannerName: { type: String, default: "" },

    image: {
        type: String,
        default: "",
        maxlength: 2000000
    },

    terms: {
        type: Boolean,
        default: false
    },

    // Event status
    status: {
        type: String,
        enum: [
            "upcoming",
            "completed",
            "cancelled",
            "archived"
        ],
        default: "upcoming"
    },

    archivedAt: {
        type: Date,
        default: null
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
