const router = require("express").Router();

const Appointment = require("../models/Appointment.model");

const User = require("../models/User.model");
const Pro = require("../models/Pro.model");

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

// Get appointments by proId
router.get("/pro/:proId", async (req, res) => {
  const { proId } = req.params;

  try {
    const appointments = await Appointment.find({ pro: proId });
    if (!appointments.length) {
      return res
        .status(404)
        .json({ error: "No appointments found for this professional" });
    }
    res.json(appointments);
  } catch (error) {
    console.error("Error getting appointments by proId:", error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
});

// User - Update appointment
router.put("/user/:userId/:appointmentId/update", async (req, res) => {
  const { userId, appointmentId } = req.params;
  const { title, startTime, endTime, notes } = req.body;

  try {
    // Ensure the appointment belongs to the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const appointmentIndex = user.appointments.indexOf(appointmentId);
    if (appointmentIndex === -1) {
      return res
        .status(404)
        .json({ error: "Appointment not found for this user" });
    }

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

// Pro User - Update appointment

router.put("/pro/:proId/:appointmentId/update", async (req, res) => {
  const { proId, appointmentId } = req.params;
  const { title, startTime, endTime, notes } = req.body;

  try {
    // Ensure the appointment belongs to the user
    const pro = await Pro.findById(proId);
    if (!pro) {
      return res.status(404).json({ error: "User not found" });
    }

    const appointmentIndex = pro.appointments.indexOf(appointmentId);
    if (appointmentIndex === -1) {
      return res
        .status(404)
        .json({ error: "Appointment not found for this user" });
    }

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

//Pro delete appointment

router.delete("/delete/:proId/:userId/:appointmentId/", async (req, res) => {
  const { appointmentId, userId, proId } = req.params;

  try {
    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    await User.findByIdAndUpdate(userId, {
      $pull: { appointments: appointmentId },
    });

    // Remove the appointment from the pro's appointments array
    await Pro.findByIdAndUpdate(proId, {
      $pull: { appointments: appointmentId },
    });
    console.log("Appointment deleted:", appointment);
    res.status(200).json({ message: "Appointment successfully deleted" });
  } catch (error) {
    console.error("Error while deleting appointment ->", error);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

//User delete appointment

/*router.delete("/delete/:userId/:proId/:appointmentId/", async (req, res) => {
  const { appointmentId, userId, proId } = req.params;

  try {
    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    await User.findByIdAndUpdate(userId, {
      $pull: { appointments: appointmentId },
    });

    // Remove the appointment from the pro's appointments array
    await Pro.findByIdAndUpdate(proId, {
      $pull: { appointments: appointmentId },
    });
    console.log("Appointment deleted:", appointment);
    res.status(200).json({ message: "Appointment successfully deleted" });
  } catch (error) {
    console.error("Error while deleting appointment ->", error);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});`*/
//

module.exports = router;
