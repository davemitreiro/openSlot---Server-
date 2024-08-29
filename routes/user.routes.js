const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middleware/jwt-middleware.js");

const User = require("../models/User.model");

router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    })
    .catch((err) => {
      console.error("Error getting user:", err);
      res.status(500).json({ error: "Failed to get user" });
    });
});

router.put("/:userId", isAuthenticated, (req, res) => {
  const { userId } = req.params;
  const { email, password } = req.body;

  User.findByIdAndUpdate(
    userId,
    {
      email,
      password,
    },
    { new: true }
  )
    .then((user) => {
      console.log("User updated:", user);
      res.status(201).json(user);
    })
    .catch((error) => {
      console.error("Error while updating user account ->", error);
      res.status(500).json({ error: "Failed to update user account" });
    });
});

router.delete("/:userId", isAuthenticated, (req, res) => {
  const { userId } = req.params;

  User.findByIdAndDelete(userId)
    .then((user) => {
      console.log("User deleted:", userId);
      res.status(201).json(user);
    })
    .catch((error) => {
      console.error("Error while deleting user account ->", error);
      res.status(500).json({ error: "Failed to delete user account" });
    });
});

module.exports = router;
