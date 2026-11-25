const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Event = require("../models/Event");

const populateRegistration = (query) =>
  query
    .populate(
      "studentId",
      "name studentId email department semester"
    )
    .populate(
      "eventId",
      "title category icon date venue organizer fee status"
    );

// Register for an event
const registerEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const now = new Date();

    // Check event availability
    if (event.status !== "upcoming" || event.date <= now) {
      return res.status(400).json({
        success: false,
        message: "This event is not available for registration.",
      });
    }

    // Check registration opening date
    if (
      event.registrationStartDate &&
      now < event.registrationStartDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration has not opened yet.",
      });
    }

    // Check registration deadline
    if (
      event.registrationDeadline &&
      now > event.registrationDeadline
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline has passed.",
      });
    }

    // Check student eligibility
    const years = [
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
    ];

    const studentYear =
      years[Math.ceil(req.user.semester / 2) - 1];

    if (
      event.audience === "Specific Batch" &&
      event.specificYear !== studentYear
    ) {
      return res.status(403).json({
        success: false,
        message: `This event is only for ${event.specificYear} students.`,
      });
    }

    // Check existing registration
    const existing = await Registration.findOne({
      studentId: req.user._id,
      eventId,
    });

    if (existing && existing.status !== "cancelled") {
      return res.status(409).json({
        success: false,
        message: "You have already registered for this event.",
      });
    }

    // Check available seats
    const registeredCount = await Registration.countDocuments({
      eventId,
      status: { $in: ["registered", "attended"] },
    });

    if (registeredCount >= event.capacity) {
      return res.status(409).json({
        success: false,
        message: "All seats are filled.",
      });
    }

    const registrationData = {
      status: "registered",
      amount: event.fee || 0,
      paymentStatus: event.fee > 0 ? "pending" : "free",
      registeredAt: now,
      cancelledAt: null,
    };

    let registration;

    // Allow cancelled students to register again
    if (existing) {
      registration = await Registration.findOneAndUpdate(
        {
          _id: existing._id,
          status: "cancelled",
        },
        { $set: registrationData },
        { new: true, runValidators: true }
      );

      if (!registration) {
        return res.status(409).json({
          success: false,
          message: "Registration already exists.",
        });
      }
    } else {
      registration = await Registration.create({
        studentId: req.user._id,
        eventId,
        ...registrationData,
      });
    }

    const result = await populateRegistration(
      Registration.findById(registration._id)
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      registration: result,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already registered for this event.",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not complete registration.",
    });
  }
};

// Get logged-in student's registrations
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await populateRegistration(
      Registration.find({
        studentId: req.user._id,
      }).sort({ registeredAt: -1 })
    );

    return res.json({
      success: true,
      count: registrations.length,
      registrations,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch registrations.",
    });
  }
};

// Get all registrations (admin)
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await populateRegistration(
      Registration.find().sort({ registeredAt: -1 })
    );

    return res.json({
      success: true,
      count: registrations.length,
      registrations,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch registrations.",
    });
  }
};

// Get registrations for a particular event
const getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const registrations = await populateRegistration(
      Registration.find({
        eventId: id,
      }).sort({ registeredAt: -1 })
    );

    return res.json({
      success: true,
      count: registrations.length,
      registrations,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch event registrations.",
    });
  }
};

// Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID.",
      });
    }

    const registration = await populateRegistration(
      Registration.findOneAndUpdate(
        {
          _id: req.params.id,
          studentId: req.user._id,
          status: "registered",
        },
        {
          $set: {
            status: "cancelled",
            cancelledAt: new Date(),
          },
        },
        { new: true, runValidators: true }
      )
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "No active registration found.",
      });
    }

    return res.json({
      success: true,
      message: "Registration cancelled successfully.",
      registration,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not cancel registration.",
    });
  }
};

module.exports = {
  registerEvent,
  getMyRegistrations,
  getAllRegistrations,
  getEventRegistrations,
  cancelRegistration,
};