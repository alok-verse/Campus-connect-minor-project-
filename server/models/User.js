
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    studentId: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true,
        required: function () {
            return this.role === "student";
        }
    },

    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        required: function () {
            return this.role === "admin";
        }
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    role: {
        type: String,
        enum: ["student", "admin"],
        default: "student"
    },

    department: {
        type: String,
        default: ""
    },

    semester: {
        type: Number,
        min: 1,
        default: 1
    },

    profileImage: {
        type: String,
        default: ""
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
