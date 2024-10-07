// We reuse this import in order to have access to the `body` property in requests
const express = require("express");

// ℹ️ Responsible for the messages you see in the terminal as requests are coming in
// https://www.npmjs.com/package/morgan
const logger = require("morgan");

// ℹ️ Needed when we deal with cookies (we will when dealing with authentication)
// https://www.npmjs.com/package/cookie-parser
const cookieParser = require("cookie-parser");

// ℹ️ Needed to accept requests from 'the outside'. CORS stands for cross-origin resource sharing
// unless the request is from the same domain, by default express won't accept POST requests
const cors = require("cors");

// Set the frontend URL from the environment variable, fallback to localhost during development
const FRONTEND_URL = process.env.ORIGIN || "http://localhost:5173";

// Middleware configuration
module.exports = (app) => {
  // Enable trust proxy for services like Vercel or Heroku that use proxies
  app.set("trust proxy", 1);

  // CORS configuration
  app.use(
    cors({
      origin: [FRONTEND_URL], // Allow requests from your frontend URL
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow these methods
      credentials: true, // Allow cookies and credentials to be sent in requests
      allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
    })
  );

  // Handle preflight requests (OPTIONS method)
  app.options("*", cors());

  // Logger for development environment
  app.use(logger("dev"));

  // Parse incoming requests with JSON payloads
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Cookie parser to manage cookies in requests
  app.use(cookieParser());

  // (Optional) Add this for debugging CORS
  app.use((req, res, next) => {
    console.log("CORS headers for request:", res.getHeaders());
    next();
  });
};
