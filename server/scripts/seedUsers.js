
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const seedUsers = async () => {
    try {
        await connectDB();

        const studentPassword = process.env.SEED_STUDENT_PASSWORD;
        const adminPassword = process.env.SEED_ADMIN_PASSWORD;

        if (!studentPassword || !adminPassword) {
            throw new Error("Seed passwords are missing in .env");
        }

        await User.init();

        const student = await User.findOne({
            studentId: "SBU2400001"
        });

        if (!student) {
            await User.create({
                name: "Demo Student",
                studentId: "SBU2400001",
                password: await bcrypt.hash(studentPassword, 12),
                role: "student",
                department: "BCA",
                semester: 5
            });

            console.log("Student account created!");
        } else {
            console.log("Student account already exists.");
        }

        const admin = await User.findOne({
            email: "admin@example.com"
        });

        if (!admin) {
            await User.create({
                name: "Campus Administrator",
                email: "admin@example.com",
                password: await bcrypt.hash(adminPassword, 12),
                role: "admin",
                department: "Administration"
            });

            console.log("Admin account created!");
        } else {
            console.log("Admin account already exists.");
        }

        console.log("Database seeding completed!");

    } catch (error) {
        console.error("Seeding failed:", error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
};

seedUsers();
