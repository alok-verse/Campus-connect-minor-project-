
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const registrationRoutes = require("./routes/registrationRoutes");

dotenv.config();

const connectDB = require("./config/db");

// Database models
require("./models/User");
require("./models/Event");
require("./models/Registration");
require("./models/Notification");

// Import routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    }
}));

app.use(express.json({ limit: "4mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/notifications", notificationRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Campus Connect Backend is Running!"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "Online",
        project: "Campus Connect",
        university: "Sarala Birla University",
        database: mongoose.connection.readyState === 1
            ? "Connected"
            : "Disconnected"
    });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    });
};

startServer();
