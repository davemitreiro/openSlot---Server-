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
  (req, res) => {
    const { userId } = req.params;
    const { email, password, fullName } = req.body;

    // If a file is uploaded, use its path; otherwise, keep the current image URL.
    const img = req.file
      ? req.file.path // Cloudinary URL is stored in req.file.path
      : req.body.img;

    // Include the `img` field in the update operation.
    User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email,
        password,
        img,
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
