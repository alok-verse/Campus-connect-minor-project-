
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

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json({ limit: "4mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);

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
