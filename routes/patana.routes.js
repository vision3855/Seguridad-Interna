const express = require("express");
const {
  newPatana,
  getAllPatana,
} = require("../controllers/patana.controllers");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// define the home page route
router.post("/", authMiddleware.protect, newPatana);
router.get("/", authMiddleware.protect, getAllPatana);

module.exports = router;
