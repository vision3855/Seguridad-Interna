const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);

        resolve({
          filename: buf.toString("hex") + path.extname(file.originalname),
          bucketName: "uploads",
        });
      });
    });
  },
});

module.exports = multer({ storage });
