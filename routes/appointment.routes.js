const router = require("express").Router();

const Appointment = require("../models/Appointment.model");

const User = require("../models/User.model");
const Pro = require("../models/Pro.model");

// -----------------------
// -> You don't need this route, at least for now
// -----------------------

//get all apointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("user")
      .populate("pro");
    console.log("Retrieved appointments ->", appointments);
    res.json(appointments);
  } catch (error) {
    console.error("Error while retrieving appointments ->", error);
    res.status(500).json({ error: "Failed to retrieve appointments" });
  }
});

// Get all appointments by userID
router.get("/user/:userId/all", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("appointments");
    console.log("Retrieved appointments ->", user.appointments);
    res.json(user.appointments);
  } catch (error) {
    console.error("Error while retrieving appointments ->", error);
    res.status(500).json({ error: "Failed to retrieve appointments" });
  }
});

// -----------------------
// -> You don't need this route, at least for now
// -----------------------

//Get all appointments by proID
router.get("/pro/:proId/all", async (req, res) => {
  const { proId } = req.params;

  try {
    const pro = await Pro.findById(proId).populate("appointments");

    if (!pro) {
      return res.status(404).json({ error: "Professional not found" });
    }

    console.log("Retrieved appointments ->", pro.appointments);
    res.json(pro.appointments);
  } catch (error) {
    console.error("Error while retrieving appointments ->", error);
    res.status(500).json({ error: "Failed to retrieve appointments" });
  }
});

// Create a new appointment
router.post("/create", async (req, res) => {
  const { title, startTime, endTime, notes, pro, user } = req.body;

  try {
    const appointment = await Appointment.create({
      title,
      startTime,
      endTime,
      notes,
      pro,
      user,
    });
    // Add the appointment to the user's appointments array
    await User.findByIdAndUpdate(user, {
      $push: { appointments: appointment._id },
    });

    // Add the appointment to the pro's appointments array
    await Pro.findByIdAndUpdate(pro, {
      $push: { appointments: appointment._id },
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("pro")
      .populate("user");

    console.log("Appointment created:", populatedAppointment);
    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error("Error while creating an appointment ->", error);
    res.status(500).json({ error: "Failed to create an appointment" });
  }
});

// Get appointment by ID
router.get("/:appointmentId", async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate("pro")
      .populate("user");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error getting appointment:", error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
});

// User - Update appointment
router.put("/:appointmentId", async (req, res) => {
  const { appointmentId } = req.params;
  const { title, startTime, endTime, notes } = req.body;

  try {
    // Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { title, startTime, endTime, notes },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    console.log("Appointment updated:", updatedAppointment);
    res.json(updatedAppointment);
  } catch (error) {
    console.error("Error while updating appointment ->", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

//delete appointment
router.delete("/:appointmentId", async (req, res) => {
  const { appointmentId } = req.params;

  // Start by filtering out the appointmentId from user and Pro
  /*  try {
    const user = await Appointment.findById(appointmentId).userId;
    userAppointments = await User.findById(user).appointments;
    userAppointments.filter((appointment) => appointment !== appointmentId);
  } catch (error) {
    console.error("Error while deleting appointment from user");
  } */

  try {
    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const { user, pro } = appointment;
    // Remove the appointment from the pro's appointments array
    await User.findByIdAndUpdate(user, {
      $pull: { appointments: appointment._id },
    });

    // Remove the appointment from the pro's appointments array
    await Pro.findByIdAndUpdate(pro, {
      $pull: { appointments: appointment._id },
    });
    console.log("Appointment deleted:", appointment);
    res.status(200).json({ message: "Appointment successfully deleted" });
  } catch (error) {
    console.error("Error while deleting appointment ->", error);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

module.exports = router;
