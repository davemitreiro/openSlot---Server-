// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express

const express = require("express");

const app = express();

app.use(express.json());

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here

/* const userRoutes = require("./routes/user.routes");
app.use("/api", userRoutes);

const proRoutes = require("./routes/pro.routes");
app.use("/api", proRoutes); */

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes);

const proRoutes = require("./routes/pro.routes");
app.use("/pro", proRoutes);

const appointmentRoutes = require("./routes/appointment.routes");
app.use("/appointments", appointmentRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
