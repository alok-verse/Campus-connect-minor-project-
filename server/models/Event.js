
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
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

    organizer: {
        type: String,
        required: true
    },

    mode: {
        type: String,
        enum: ["Online", "Offline", "Hybrid"],
        default: "Offline"
    },

    icon: {
        type: String,
        default: "📅"
    },

    image: {
        type: String,
        default: ""
    },

    fee: {
        type: Number,
        min: 0,
        default: 0
    },

    capacity: {
        type: Number,
        min: 1,
        default: 100
    },

    registrationDeadline: {
        type: Date
    },

    status: {
        type: String,
        enum: ["upcoming", "completed", "cancelled", "archived"],
        default: "upcoming"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
