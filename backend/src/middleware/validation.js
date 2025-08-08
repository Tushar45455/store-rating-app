const { body, validationResult } = require('express-validator');

const userValidationRules = () => {
  return [
    body('name')
      .isLength({ min: 20, max: 60 })
      .withMessage('Name must be between 20 and 60 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8, max: 16 })
      .withMessage('Password must be between 8 and 16 characters')
      .matches(/(?=.*[A-Z])/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/)
      .withMessage('Password must contain at least one special character'),
    body('address')
      .isLength({ max: 400 })
      .withMessage('Address cannot exceed 400 characters')
  ];
};

const storeValidationRules = () => {
  return [
    body('name')
      .isLength({ min: 20, max: 60 })
      .withMessage('Store name must be between 20 and 60 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('address')
      .isLength({ max: 400 })
      .withMessage('Address cannot exceed 400 characters')
  ];
};

const ratingValidationRules = () => {
  return [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5')
  ];
};

const loginValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];
};

const passwordUpdateRules = () => {
  return [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8, max: 16 })
      .withMessage('New password must be between 8 and 16 characters')
      .matches(/(?=.*[A-Z])/)
      .withMessage('New password must contain at least one uppercase letter')
      .matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/)
      .withMessage('New password must contain at least one special character')
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  userValidationRules,
  storeValidationRules,
  ratingValidationRules,
  loginValidationRules,
  passwordUpdateRules,
  validate
};
