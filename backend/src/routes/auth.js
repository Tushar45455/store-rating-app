const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');
const { 
  userValidationRules, 
  loginValidationRules,
  passwordUpdateRules,
  validate 
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many authentication attempts, please try again later'
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: {
    message: 'Too many registration attempts, please try again later'
  }
});

// Public routes
router.post('/register', 
  registerLimiter,
  userValidationRules(), 
  validate, 
  authController.register
);

router.post('/login', 
  authLimiter,
  loginValidationRules(), 
  validate, 
  authController.login
);

// Protected routes
router.get('/profile', 
  authenticateToken, 
  authController.getProfile
);

router.put('/update-password', 
  authenticateToken,
  passwordUpdateRules(), 
  validate, 
  authController.updatePassword
);

module.exports = router;
