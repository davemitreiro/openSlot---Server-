const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middleware/jwt-middleware.js");

const Pro = require("../models/Pro.model.js");

//get pro by ID

router.get("/:proId", (req, res) => {
  const { proId } = req.params;

  Pro.findById(proId)
    .then((pro) => {
      if (!pro) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(pro);
    })
    .catch((err) => {
      console.error("Error getting user:", err);
      res.status(500).json({ error: "Failed to get user" });
    });
});

//update pro
router.put("/:proId", isAuthenticated, (req, res) => {
  const { proId } = req.params;
  const { fullname, email, password } = req.body;

  Pro.findByIdAndUpdate(
    proId,
    {
      fullname,
      email,
      password,
    },
    { new: true }
  )
    .then((pro) => {
      console.log("User updated:", pro);
      res.status(201).json(pro);
    })
    .catch((error) => {
      console.error("Error while updating professional user ->", error);
      res.status(500).json({ error: "Failed to update professional user" });
    });
});

//delete pro
router.delete("/:proId", isAuthenticated, (req, res) => {
  const { proId } = req.params;

  Pro.findByIdAndDelete(proId)
    .then((pro) => {
      console.log("User deleted:", proId);
      res.status(201).json(pro);
    })
    .catch((error) => {
      console.error("Error while deleting professional user ->", error);
      res.status(500).json({ error: "Failed to delete professional user" });
    });
});

module.exports = router;
