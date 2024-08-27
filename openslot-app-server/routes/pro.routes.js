const router = require("express").Router();
const mongoose = require("mongoose");

const Pro = require("../models/Pro.model");

router.get("/pro", (req, res) => {
  Pro.find({})
    .then((pro) => {
      console.log("Retrieved account ->", pro);
      res.json(pro);
    })
    .catch((error) => {
      console.error("Error while retrieving professional accounts ->", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve professional accounts" });
    });
});

//create pro
router.post("/pro", (req, res, next) => {
  const { fullname, email, password } = req.body;

  Pro.create(
    {
      fullname,
      email,
      password,
    },
    { new: true }
  )
    .then((pro) => {
      console.log("Account created:", pro);
      res.status(201).json(pro);
    })
    .catch((error) => {
      console.error("Error while creating a professional account ->", error);
      res
        .status(500)
        .json({ error: "Failed to create a professional account" });
    });
});

//get pro by ID

router.get("/pro/:proId", (req, res) => {
  const { proId } = req.params;

  /*if (!mongoose.Types.ObjectId.isValid(proId)) {
    return res.status(400).json({ error: "Invalid pro ID format" });
  }*/
  Pro.findById(proId)
    .then((pro) => {
      if (!pro) {
        return res.status(404).json({ error: "Pro not found" });
      }

      res.json(pro);
    })
    .catch((err) => {
      console.error("Error getting pro:", err);
      res.status(500).json({ error: "Failed to get pro" });
    });
});

//update pro
router.put("/pro/:proId", (req, res) => {
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
      console.log("Account updated:", pro);
      res.status(201).json(pro);
    })
    .catch((error) => {
      console.error("Error while updating professional account ->", error);
      res.status(500).json({ error: "Failed to update professional account" });
    });
});

//delete pro
router.delete("/pro/:proId", (req, res) => {
  const { proId } = req.params;

  Pro.findByIdAndDelete(proId)
    .then((pro) => {
      console.log("Pro deleted:", proId);
      res.status(201).json(pro);
    })
    .catch((error) => {
      console.error("Error while deleting professional account ->", error);
      res.status(500).json({ error: "Failed to delete professional account" });
    });
});

module.exports = router;
