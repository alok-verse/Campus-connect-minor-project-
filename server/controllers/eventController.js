
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

// Fields that admins are allowed to modify
const allowedFields = [
    "title",
    "description",
    "category",
    "date",
    "venue",
    "organizer",
    "phone",
    "email",
    "college",
    "mode",
    "icon",
    "image",
    "bannerName",
    "fee",
    "capacity",
    "registrationStartDate",
    "registrationDeadline",
    "audience",
    "specificYear",
    "highlights",
    "instructions",
    "dressCode",
    "payment",
    "qrName",
    "qrData",
    "terms",
    "status"
];

// Extract allowed fields
const getEventData = (body) => {
    const data = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            data[field] = body[field];
        }
    }

    return data;
};

// Validate registration schedule
const validateSchedule = (event) => {
    if (
        event.registrationDeadline &&
        event.registrationDeadline > event.date
    ) {
        return "Registration deadline cannot be after the event date.";
    }

    if (
        event.registrationStartDate &&
        event.registrationDeadline &&
        event.registrationStartDate > event.registrationDeadline
    ) {
        return "Registration start date cannot be after the registration deadline.";
    }

    if (
        event.registrationStartDate &&
        event.registrationStartDate > event.date
    ) {
        return "Registration start date cannot be after the event date.";
    }

    return null;
};

// Common error handler
const handleError = (res, error) => {
    if (
        error.name === "ValidationError" ||
        error.name === "CastError"
    ) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error."
    });
};

// 1. Get all public events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find({
            status: { $in: ["upcoming", "completed"] }
        })
            .select("-createdBy")
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            count: events.length,
            events
        });

    } catch (error) {
        handleError(res, error);
    }
};

// 2. Get a single public event
const getEventById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const event = await Event.findOne({
            _id: req.params.id,
            status: { $in: ["upcoming", "completed"] }
        }).select("-createdBy");

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        res.status(200).json({
            success: true,
            event
        });

    } catch (error) {
        handleError(res, error);
    }
};

// 3. Get all events for admin
const getAdminEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: events.length,
            events
        });

    } catch (error) {
        handleError(res, error);
    }
};

// 4. Create a new event
const createEvent = async (req, res) => {
    try {
        const data = getEventData(req.body || {});

        const event = new Event({
            ...data,
            createdBy: req.user._id
        });

        // Validate registration schedule
        const scheduleError = validateSchedule(event);

        if (scheduleError) {
            return res.status(400).json({
                success: false,
                message: scheduleError
            });
        }

        // Set archive timestamp if required
        if (event.status === "archived") {
            event.archivedAt = new Date();
        }

        await event.save();

        res.status(201).json({
            success: true,
            message: "Event created successfully!",
            event
        });

    } catch (error) {
        handleError(res, error);
    }
};

// 5. Update an existing event
const updateEvent = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        const data = getEventData(req.body || {});

        event.set(data);

        // Handle archive and restore timestamps
        if (data.status === "archived") {
            event.archivedAt =
                event.archivedAt || new Date();

        } else if (data.status) {
            event.archivedAt = null;
        }

        // Validate updated registration schedule
        const scheduleError = validateSchedule(event);

        if (scheduleError) {
            return res.status(400).json({
                success: false,
                message: scheduleError
            });
        }

        await event.save();

        res.status(200).json({
            success: true,
            message: "Event updated successfully!",
            event
        });

    } catch (error) {
        handleError(res, error);
    }
};

// 6. Archive an event
const archiveEvent = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        event.status = "archived";

        event.archivedAt =
            event.archivedAt || new Date();

        await event.save();

        res.status(200).json({
            success: true,
            message: "Event archived successfully!",
            event
        });

    } catch (error) {
        handleError(res, error);
    }
};
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    if (event.status !== "archived") {
      return res.status(400).json({
        success: false,
        message: "Archive the event before deleting it.",
      });
    }

    const hasRegistrations = await Registration.exists({
      eventId: event._id,
    });

    if (hasRegistrations) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete an event with registration records.",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event permanently deleted.",
    });
  } catch (error) {
    return res.status(error.name === "CastError" ? 400 : 500).json({
      success: false,
      message: "Could not delete event.",
    });
  }
};
module.exports = {
  getEvents,
  getEventById,
  getAdminEvents,
  createEvent,
  updateEvent,
  archiveEvent,
  deleteEvent,
};