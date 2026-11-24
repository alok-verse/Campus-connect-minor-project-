
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["announcement", "event", "reminder"],
        default: "announcement"
    },

    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    },

    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);
