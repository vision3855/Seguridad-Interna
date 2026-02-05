const express = require("express");
const mongoose = require("mongoose");
const upload = require("../multer");
const getGfs = require("../gridfs");

const router = express.Router();

/**
 * Upload image
 */
router.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    message: "Image uploaded successfully",
    file: req.file,
  });
});

/**
 * Get image by filename
*/
router.get("/:filename", async (req, res) => {
  const gfs = getGfs();

  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (!file.contentType.startsWith("image")) {
      return res.status(400).json({ message: "Not an image" });
    }

    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  });
});

module.exports = router;