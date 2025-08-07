const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');
const { ratingValidationRules, validate } = require('../middleware/validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All store routes require authentication
router.use(authenticateToken);

// Routes for normal users
router.get('/', 
  authorizeRoles('normal_user'), 
  storeController.getAllStores
);

router.post('/:storeId/rate', 
  authorizeRoles('normal_user'),
  ratingValidationRules(), 
  validate, 
  storeController.rateStore
);

// Routes for store owners
router.get('/owner/dashboard', 
  authorizeRoles('store_owner'), 
  storeController.getOwnerDashboard
);

router.get('/:storeId/ratings',
  authorizeRoles('store_owner'),
  storeController.getStoreRatings
);

module.exports = router;
