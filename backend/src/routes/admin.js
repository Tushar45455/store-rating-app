const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { 
  userValidationRules, 
  storeValidationRules,
  validate 
} = require('../middleware/validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('system_admin'));

// Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.post('/users', 
  userValidationRules(), 
  validate, 
  adminController.createUser
);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);

// Store management
router.post('/stores', 
  storeValidationRules(), 
  validate, 
  adminController.createStore
);

router.get('/stores', adminController.getStores);

module.exports = router;
