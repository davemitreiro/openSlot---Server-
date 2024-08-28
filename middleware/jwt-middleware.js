const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    const payload = jwt.verify(token, process.env.SECRET_TOKEN);

    // Add payload to the request object
    req.payload = payload;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = isAuthenticated;
