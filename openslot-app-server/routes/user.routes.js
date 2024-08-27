const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.get("/users", (req, res) => {
  res.status(201).json();
});

module.exports = router;
