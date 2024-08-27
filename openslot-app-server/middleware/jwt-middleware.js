const jwt = require("jsonwebtoken");

// Instantiate the JWT token validation middleware
const isAuthenticated = (req, res, next) => {
  try {
    // Check if the Authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Get the token string from the authorization header - "Bearer eyJh5kp9..."
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // Verify the token. Returns payload if the token is valid, otherwise throws an error
    const payload = jwt.verify(token, process.env.SECRET_TOKEN);

    // Add payload to the request object as req.payload for use in next middleware or route
    req.payload = payload;

    // Call next() to pass the request to the next middleware function or route
    next();
  } catch (error) {
    // Catch errors and return a 401 status code and a descriptive error message
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Export the middleware so that we can use it to create protected routes
module.exports = isAuthenticated;
