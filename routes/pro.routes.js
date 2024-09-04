const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middleware/jwt-middleware.js");

const Pro = require("../models/Pro.model.js");

const fileUploader = require("../config/cloudinary.config");

router.put(
  "/:proId",
  isAuthenticated,
  fileUploader.single("img"),
  (req, res) => {
    const { proId } = req.params;
    const { email, password, fullName } = req.body;

    // If a file is uploaded, use its path; otherwise, keep the current image URL.
    const img = req.file
      ? req.file.path // Cloudinary URL is stored in req.file.path
      : req.body.img;

    // Include the `img` field in the update operation.
    Pro.findByIdAndUpdate(
      proId,
      {
        fullName,
        email,
        password,
        img,
      },
      { new: true }
    )
      .then((pro) => {
        console.log("Pro updated:", pro);
        res.status(201).json(pro);
      })
      .catch((error) => {
        console.error("Error while updating pro account ->", error);
        res.status(500).json({ error: "Failed to update pro account" });
      });
  }
);

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
router.put("/:proId", isAuthenticated, async (req, res) => {
  const { proId } = req.params;
  const { fullName, email, password, img } = req.body;

  const updatePro = await Pro.findByIdAndUpdate(
    proId,
    {
      fullName,
      img,
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
