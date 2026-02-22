const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = {
    // Protect routes - verify token
    protect: async (req, res, next) => {
        try {
            let token;

            // Check authorization header
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized to access this route'
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Add user to request object
            req.user = user;
            next();

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }
            
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // Authorize by roles
    authorize: (...roles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized'
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `User role ${req.user.role} is not authorized to access this route`
                });
            }

            next();
        };
    },

    // Optional auth - doesn't require token but attaches user if present
    optional: async (req, res, next) => {
        try {
            let token;

            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user) {
                    req.user = user;
                }
            }
            
            next();
        } catch (error) {
            // Just continue without user
            next();
        }
    }
};

module.exports = authMiddleware;