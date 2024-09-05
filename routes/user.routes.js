const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middleware/jwt-middleware.js");

const User = require("../models/User.model");

const fileUploader = require("../config/cloudinary.config");

router.get("/", (req, res) => {
  User.find({})
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.error("Error getting users:", err);
      res.status(404).json({ error: "Users not found" });
    });
});

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

// -> use only /:userID
// -----------------------

router.put(
  "/:userId",
  isAuthenticated,
  fileUploader.single("img"),
  async (req, res) => {
    const { userId } = req.params;
    const { fullName, email, password } = req.body;
    const img = req.file ? req.file.path : undefined; // Get the uploaded image URL from Cloudinary

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          fullName,
          email,
          password,
          img, // Set the image URL
        },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log("User updated:", updatedUser);
      res.status(200).json(updatedUser); // Status 200 is more appropriate for successful updates
    } catch (error) {
      console.error("Error while updating user ->", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  }
);

// -----------------------
// -> /:userId/delete why?
// -> use only /:userID
// -----------------------

router.delete("/:userId", isAuthenticated, (req, res) => {
  const { userId } = req.params;

  User.findByIdAndDelete(userId)
    .then((user) => {
      console.log("User deleted:", userId);
      res.status(201).json({ message: "User deleted succesfully" });
    })
    .catch((error) => {
      console.error("Error while deleting user account ->", error);
      res.status(500).json({ error: "Failed to delete user account" });
    });
});

module.exports = router;
