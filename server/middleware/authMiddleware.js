
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token
const protect = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please log in."
            });
        }

        const token = authorization.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        const user = await User.findById(decoded.id).select("-password");

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid user account."
            });
        }

        req.user = user;

        next();

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

// Allow only admins
const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required."
        });
    }

    next();
};

// Allow only students
const studentOnly = (req, res, next) => {
    if (req.user.role !== "student") {
        return res.status(403).json({
            success: false,
            message: "Student access required."
        });
    }

    next();
};

module.exports = { protect, adminOnly, studentOnly };
