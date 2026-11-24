
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Default route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Campus Connect Backend is Running!"
    });
});

// Health check API
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

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();
