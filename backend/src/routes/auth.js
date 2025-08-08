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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: 'Too many authentication attempts, please try again later'
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    message: 'Too many registration attempts, please try again later'
  }
});

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
