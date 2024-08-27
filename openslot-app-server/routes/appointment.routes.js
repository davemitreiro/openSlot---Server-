const router = require("express").Router();
const mongoose = require("mongoose");

const Appointment = require("../models/Appointment.model");

router.get("/appointment", (req, res) => {
  Appointment.find({})
    .then((appointment) => {
      console.log("Retrieved account ->", appointment);
      res.json(appointment);
    })
    .catch((error) => {
      console.error("Error while retrieving appointments ->", error);
      res.status(500).json({ error: "Failed to retrieve appointments" });
    });
});

//create appointment
router.post("/appointment", (req, res, next) => {
  const { name } = req.body;

  Appointment.create(
    {
      name,
    },
    { new: true }
  )
    .then((appointment) => {
      console.log("Account created:", appointment);
      res.status(201).json(appointment);
    })
    .catch((error) => {
      console.error(
        "Error while creating a appointmentfessional account ->",
        error
      );
      res
        .status(500)
        .json({ error: "Failed to create a appointmentfessional account" });
    });
});

//get appointment by ID

router.get("/appointment/:appointmentId", (req, res) => {
  const { appointmentId } = req.params;

  /*if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(400).json({ error: "Invalid appointment ID format" });
  }*/
  Appointment.findById(appointmentId)
    .then((appointment) => {
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      res.json(appointment);
    })
    .catch((err) => {
      console.error("Error getting Appointment:", err);
      res.status(500).json({ error: "Failed to get Appointment" });
    });
});

//update appointment
router.put("/appointment/:appointmentId", (req, res) => {
  const { appointmentId } = req.params;
  const { name } = req.body;

  Appointment.findByIdAndUpdate(
    appointmentId,
    {
      name,
    },
    { new: true }
  )
    .then((appointment) => {
      console.log("Account updated:", appointment);
      res.status(201).json(appointment);
    })
    .catch((error) => {
      console.error("Error while updating appointments ->", error);
      res.status(500).json({ error: "Failed to update appointments" });
    });
});

//delete appointment
router.delete("/appointment/:appointmentId", (req, res) => {
  const { appointmentId } = req.params;

  Appointment.findByIdAndDelete(appointmentId)
    .then((appointment) => {
      console.log("appointment deleted:", appointmentId);
      res.status(201).json(appointment);
    })
    .catch((error) => {
      console.error("Error while deleting appointments ->", error);
      res.status(500).json({ error: "Failed to delete Appointment" });
    });
});

module.exports = router;
