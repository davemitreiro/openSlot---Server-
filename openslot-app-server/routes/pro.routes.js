const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.get("/pro", (req, res) => {});

module.exports = router;
