const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Image = require('../models/image');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

router.get('/', async (req, res) => {
  try {
    const images = await Image.find({}, { 'image.data': 0 });
    res.json({
      success: true,
      count: images.length,
      images
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET image metadata FIRST
router.get('/metadata/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id, { 'image.data': 0 });
    if (!image) return res.status(404).json({ success: false });
    res.json({ success: true, image });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false });

    res.set('Content-Type', image.image.contentType);
    res.send(image.image.data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/images/upload
// @desc    Upload image to MongoDB
// @access  Public (add your auth middleware if needed)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const newImage = new Image({
      name: req.file.originalname,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await newImage.save();

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      imageId: newImage._id,
      name: newImage.name,
      uploadDate: newImage.uploadDate
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @route   GET /api/images
// @desc    Get all images (metadata only, no binary data)
// @access  Public


/* router.get('/', async (req, res) => {
  try {
    const images = await Image.find({}, { 'image.data': 0 });
    res.json({
      success: true,
      count: images.length,
      images: images
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @route   GET /api/images/:id
// @desc    Get single image by ID (returns actual image binary)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    }

    res.set('Content-Type', image.image.contentType);
    res.send(image.image.data);
  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @route   GET /api/images/metadata/:id
// @desc    Get single image metadata (no binary data)
// @access  Public
router.get('/metadata/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id, { 'image.data': 0 });
    
    if (!image) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    }

    res.json({
      success: true,
      image: image
    });
  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});
 */
// @route   DELETE /api/images/:id
// @desc    Delete image by ID
// @access  Public (add your auth middleware if needed)
router.delete('/:id', async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    
    if (!image) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Image deleted successfully' 
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;