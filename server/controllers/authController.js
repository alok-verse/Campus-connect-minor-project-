
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
};

// Student and Admin Login
const login = async (req, res) => {
    try {
        const { studentId, email, password, role } = req.body;

        if (
            typeof password !== "string" ||
            !password ||
            !["student", "admin"].includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid login details."
            });
        }

        let query;

        if (role === "student") {
            if (typeof studentId !== "string" || !studentId.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Student ID is required."
                });
            }

            query = {
                studentId: studentId.trim().toUpperCase(),
                role: "student"
            };
        } else {
            if (typeof email !== "string" || !email.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required."
                });
            }

            query = {
                email: email.trim().toLowerCase(),
                role: "admin"
            };
        }

        const user = await User.findOne(query).select("+password");

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid login credentials."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid login credentials."
            });
        }

        res.status(200).json({
            success: true,
            message: "Login successful!",
            token: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                studentId: user.studentId,
                email: user.email,
                role: user.role,
                department: user.department,
                semester: user.semester
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Get logged-in user
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};


// Update student profile
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 60
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid full name."
            });
        }

        if (
            typeof email !== "string" ||
            email.trim().length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const user = await User.findOneAndUpdate(
            {
                _id: req.user._id,
                role: "student",
                isActive: true
            },
            {
                $set: {
                    name: name.trim(),
                    email: email.trim().toLowerCase()
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student account not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user: {
                id: user._id,
                name: user.name,
                studentId: user.studentId,
                email: user.email,
                role: user.role,
                department: user.department,
                semester: user.semester
            }
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This email address is already in use."
            });
        }

        console.error("Profile update error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Could not update profile."
        });
    }
};

module.exports = { login, getMe, updateProfile };

