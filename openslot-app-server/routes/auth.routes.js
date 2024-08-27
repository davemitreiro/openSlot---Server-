const express = require("express");

const router = express.Router();

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const User = require("../models/User.model");

const isAuthenticated = require("../middleware/jwt-middleware.js");

const mongoose = require("mongoose");
// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 12;

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", (req, res, next) => {
  const { email, password, fullname, age } = req.body;

  // Check if email or password or name are provided
  if (!email || !fullname || !age || !password) {
    res.status(400).json({ message: "Provide email, password and name" });
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

  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create the new user in the database
      // We return a pending promise, which allows us to chain another `then`
      return User.create({
        email,
        password: hashedPassword,
        fullname,
        age,
      });
    })
    .then((createdUser) => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { email, fullname, _id, age } = createdUser;

      // Create a new object that doesn't expose the password
      const user = { email, fullname, _id, age };

      // Send a json response containing the user object
      res.status(201).json({ user });
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (!email || !password) {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, fullname, age } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, fullname, age };

        // Create a JSON Web Token and sign it
        const authToken = jwt.sign(payload, process.env.SECRET_TOKEN, {
          algorithm: "HS256",
          expiresIn: "5h",
        });

        // Send the token as the response
        res.status(200).json({ authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

router.get("/user", isAuthenticated, (req, res, next) => {
  // The user details are available in req.payload due to the isAuthenticated middlewaretrue
  const user = req.payload;
  res.status(200).json(user);
  console.log(user);
});

//get user by ID
router.get("/user/:userId", isAuthenticated, (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

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

//update user
router.put("/user/:userId", isAuthenticated, (req, res) => {
  const { userId } = req.params;
  const { fullname, age, email, password } = req.body;

  User.findByIdAndUpdate(
    userId,
    {
      fullname,
      age,
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
      console.error("Error while updating user ->", error);
      res.status(500).json({ error: "Failed to update user" });
    });
});

//delete user
router.delete("/user/:userId", isAuthenticated, (req, res) => {
  const { userId } = req.params;

  User.findByIdAndDelete(userId)
    .then((user) => {
      console.log("User deleted:", user);
      res.status(201).json(user);
    })
    .catch((error) => {
      console.error("Error while deleting user ->", error);
      res.status(500).json({ error: "Failed to delete user" });
    });
});

module.exports = router;
