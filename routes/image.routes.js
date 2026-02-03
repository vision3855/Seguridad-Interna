const express = require("express");
const uploadSingleImage = require("../middleware/upload.middleware.js");
const uploadImage = require("../controllers/image.controller.js");

const router = express.Router();

router.post(
  "/upload",
  uploadSingleImage("image"),
  uploadImage
);

module.exports = router;
