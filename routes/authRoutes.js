const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes - require authentication
router.use(authMiddleware.protect);

router.get('/me', authController.getMe);
router.put('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);

// Admin only routes
router.get('/users', 
    authMiddleware.authorize('admin'), 
    authController.getUsers
);

router.delete('/users/:id', 
    authMiddleware.authorize('admin'), 
    authController.deleteUser
);

module.exports = router;