const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middleware/jwt-middleware.js");
const bcrypt = require("bcrypt");

const Pro = require("../models/Pro.model.js");

const fileUploader = require("../config/cloudinary.config");

const saltRounds = 12;

//get all pros

router.get("/", (req, res) => {
  Pro.find({})
    .then((pro) => {
      res.status(201).json(pro);
    })
    .catch((err) => {
      console.error("Error getting pro users:", err);
      res.status(404).json({ error: "Pro users not found" });
    });
});

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

// -----------------------
// -> /:proId/update why?
// -> use only /:proId
// -----------------------

//update pro
router.put(
  "/:proId",
  isAuthenticated,
  fileUploader.single("img"), // Add the file uploader middleware
  async (req, res) => {
    const { proId } = req.params;
    const { fullName, email, password } = req.body;
    const img = req.file ? req.file.path : undefined; // Get the uploaded image URL from Cloudinary

    try {
      // Find the professional user by ID
      const existingPro = await Pro.findById(proId);

      if (!existingPro) {
        return res.status(404).json({ error: "Professional not found" });
      }

      // If a new password is provided, hash it
      let hashedPassword = existingPro.password; // Default to the existing password

      if (password) {
        const salt = bcrypt.genSaltSync(saltRounds);
        hashedPassword = bcrypt.hashSync(password, salt);
      }

      // Update the professional user
      const updatedPro = await Pro.findByIdAndUpdate(
        proId,
        {
          fullName,
          email,
          password: hashedPassword,
          img, // Set the image URL
        },
        { new: true } // Return the updated document
      );

      if (!updatedPro) {
        return res.status(404).json({ error: "Professional not found" });
      }

      console.log("Professional updated:", updatedPro);
      res.status(200).json(updatedPro); // Status 200 is more appropriate for successful updates
    } catch (error) {
      console.error("Error while updating professional user ->", error);
      res.status(500).json({ error: "Failed to update professional user" });
    }
  }
);

// -----------------------
// -> /:proId/delete why?
// -> use only /:proId
// -----------------------

//delete pro
router.delete("/:proId", isAuthenticated, (req, res) => {
  const { proId } = req.params;

  Pro.findByIdAndDelete(proId)
    .then((pro) => {
      console.log("User deleted:", proId);
      res
        .status(201)
        .json({ message: "Professional user deleted succesfully" });
    })
    .catch((error) => {
      console.error("Error while deleting professional user ->", error);
      res.status(500).json({ error: "Failed to delete professional user" });
    });
});

module.exports = router;
