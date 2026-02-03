const uploadImage = async (req, res) => {
  try {
    const imageUrl = `/${req.file.path.replace(/\\/g, "/")}`;

    // Example Mongo save
    // await Image.create({ imageUrl });

    res.status(201).json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

module.exports = uploadImage
