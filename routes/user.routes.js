const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middleware/jwt-middleware.js");
const bcrypt = require("bcrypt");

const User = require("../models/User.model");

const fileUploader = require("../config/cloudinary.config");

const saltRounds = 12;

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
  fileUploader.single("img"), // Add the file uploader middleware
  async (req, res) => {
    const { userId } = req.params;
    const { fullName, email, password } = req.body;
    const img = req.file ? req.file.path : undefined; // Get the uploaded image URL from Cloudinary

    try {
      // Find the user by ID
      const existingUser = await User.findById(userId);

      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // If a new password is provided, hash it
      let hashedPassword = existingUser.password; // Default to the existing password

      if (password) {
        const salt = bcrypt.genSaltSync(saltRounds);
        hashedPassword = bcrypt.hashSync(password, salt);
      }

      // Update the user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          fullName,
          email,
          password: hashedPassword,
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
