const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { 
  userValidationRules, 
  storeValidationRules,
  validate 
} = require('../middleware/validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('system_admin'));

router.get('/dashboard/stats', adminController.getDashboardStats);

router.post('/users', 
  userValidationRules(), 
  validate, 
  adminController.createUser
);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);

router.post('/stores', 
  storeValidationRules(), 
  validate, 
  adminController.createStore
);

router.get('/stores', adminController.getStores);

module.exports = router;
