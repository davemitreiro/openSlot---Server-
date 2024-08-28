const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User.model");
const Pro = require("../models/Pro.model.js");

const isAuthenticated = require("../middleware/jwt-middleware.js");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 12;

// ----------------------------
// UTIL: remove password from user object and change _id to id to match the frontend
// ----------------------------
function buildResponseObject(obj) {
  const newObj = { ...obj._doc };
  // Remove the password before sending the user object
  delete newObj.password;
  // Change the _id key to id
  newObj.id = newObj._id;
  delete newObj._id;

  return newObj;
}

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", async (req, res, next) => {
  const { role, data } = req.body;
  const { email, password } = data;

  // Check if email or password or name are provided
  if (!email || !password) {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // This regular expression check that the email is of a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // This regular expression checks password for special characters and minimum length
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  let foundUser;

  if (role === "pro") {
    // SIGNUP PRO
    try {
      foundUser = await Pro.findOne({ email });

      // Check if pro already exists
      if (foundUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      // If email is unique, proceed to hash password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const newUser = {
        ...data,
        password: hashedPassword,
      };

      try {
        const createdUser = await Pro.create(newUser);
        const userData = buildResponseObject(createdUser);

        res.status(201).json(userData);
      } catch (error) {
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  } else {
    // SIGNUP USER
    try {
      foundUser = await User.findOne({ email });

      // Check if the user already exists
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const newUser = {
        ...data,
        password: hashedPassword,
      };

      try {
        const createdUser = await User.create(newUser);
        const userData = buildResponseObject(createdUser);

        res.status(201).json(userData);
      } catch (error) {
        return next(err);
      }
    } catch (error) {
      return next(err);
    }
  }
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", async (req, res, next) => {
  const { role, data } = req.body;
  const { email, password } = data;

  // Check if email or password are provided as empty string
  if (!email || !password) {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // This regular expression check that the email is of a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // This regular expression checks password for special characters and minimum length
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  let foundUser;

  // Check if the user is a pro and search the user in the correct collection
  if (role === "pro") {
    // LOGIN PRO

    try {
      foundUser = await Pro.findOne({ email });

      if (!foundUser) {
        // if the user is not found, send error response
        res.status(401).json({ message: "User not found" });
        return;
      }
    } catch (error) {
      return next(error);
    }
  } else {
    try {
      // LOGIN User

      foundUser = await User.findOne({ email });

      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }
    } catch (error) {
      return next(err);
    }
  }

  // Both for users and pros, compare the provided password with the one saved in the database
  const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

  if (passwordCorrect) {
    const userData = buildResponseObject(foundUser);

    // Create a JSON Web Token and sign it
    const authToken = jwt.sign(userData, process.env.SECRET_TOKEN, {
      algorithm: "HS256",
      expiresIn: "5h",
    });

    // Send the token as the response
    res.status(200).json({ authToken });
  } else {
    res.status(401).json({ message: "Unable to authenticate the user" });
  }
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

//USER ROUTES (GetById,Update,Delete)
//--------------------------------------------------------------------------------------------------------------------------------
router.get("/user/:userId", (req, res) => {
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

router.put("/user/:userId", (req, res) => {
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

router.delete("/user/:userId", (req, res) => {
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

//PROFESSIONAL ROUTES(GetById,Update,Delete)
//-------------------------------------------------------------------------------------------------------------------------------------------

//get pro by ID

router.get("/pro/:proId", (req, res) => {
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
      console.log("User updated:", pro);
      res.status(201).json(pro);
    })
    .catch((error) => {
      console.error("Error while updating professional user ->", error);
      res.status(500).json({ error: "Failed to update professional user" });
    });
});

//delete pro
router.delete("/pro/:proId", (req, res) => {
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