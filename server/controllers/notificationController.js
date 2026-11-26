
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// Create notification (Admin only)
const createNotification = async (req, res) => {
    try {
        const { title, message, type, eventId } = req.body;

        if (
            typeof title !== "string" ||
            typeof message !== "string" ||
            !title.trim() ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required."
            });
        }

        const notification = await Notification.create({
            title: title.trim(),
            message: message.trim(),
            type: type || "announcement",
            eventId: eventId || undefined,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Notification sent successfully.",
            notification
        });

    } catch (error) {
        res.status(
            ["ValidationError", "CastError"].includes(error.name)
                ? 400 : 500
        ).json({
            success: false,
            message: "Failed to create notification."
        });
    }
};

// Get all notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate("eventId", "title")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 })
            .lean();

        const data = notifications.map((item) => {
            const { readBy, ...notification } = item;

            return {
                ...notification,
                isRead: readBy.some(
                    (id) => String(id) === String(req.user._id)
                )
            };
        });

        const unreadCount = data.filter(
            (item) => !item.isRead
        ).length;

        res.status(200).json({
            success: true,
            unreadCount,
            notifications: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications."
        });
    }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID."
            });
        }

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: {
                    readBy: req.user._id
                }
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update notification."
        });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { readBy: { $ne: req.user._id } },
            {
                $addToSet: {
                    readBy: req.user._id
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update notifications."
        });
    }
};

// Delete notification (Admin only)
const deleteNotification = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID."
            });
        }

        const notification = await Notification.findByIdAndDelete(
            req.params.id
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete notification."
        });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
