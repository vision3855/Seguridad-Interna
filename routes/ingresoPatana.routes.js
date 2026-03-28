const express = require('express');
const { createIngreso, getAllIngreso, getByDate } = require('../controllers/ingresoPatana.controllers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


// define the home page route
router.post('/', authMiddleware.protect ,createIngreso)
router.get('/',authMiddleware.protect, getAllIngreso)
router.post('/date',authMiddleware.protect, getByDate)

// define the about route 
router.get('/about', (req, res) => {
  res.send('About birds')
})

module.exports = router