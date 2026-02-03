const { multerUpload } = require("../config/multer.config.js");

const uploadSingleImage = (fieldName) => {
  return (req, res, next) => {
    multerUpload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      next();
    });
  };
};

module.exports = uploadSingleImage
