import { body, ValidationChain } from 'express-validator';
import User from '../models/User';

// Reusable email validation (checks format + uniqueness)
const emailValidation = () =>
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
;

export const validatorCreateUser: ValidationChain[] = [
  body('userName')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be 2–50 characters'),

  emailValidation()
  .custom(async (email, { req }) => {
    const existingUser = await User.findOne({ email });

    if (req.method === 'POST' && existingUser) {
      throw new Error('Email already in use');
    }
    return true;
  }),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character (!@#$%^&*)'),
];

export const validatorUpdateUser: ValidationChain[] = [
  body('userName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be 2–50 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.user.userId) {
        throw new Error('Email already in use');
      }
      return true;
    }),

  // Password update is optional — only validate if provided
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain a special character'),
];




