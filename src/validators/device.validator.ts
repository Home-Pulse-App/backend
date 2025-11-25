import { body, ValidationChain } from 'express-validator';
import { SENSOR_TYPES } from '../modules/Device';

export const validateCreateDevice: ValidationChain[] = [
  body('deviceName')
    .exists({ checkFalsy: true })
    .withMessage('deviceName is required')
    .isString()
    .withMessage('deviceName must be a string')
    .trim()
    .notEmpty()
    .withMessage('deviceName cannot be empty')
    .isLength({ max: 100 })
    .withMessage('deviceName too long'),

  body('sensors')
    .optional()
    .isArray()
    .withMessage('sensors must be an array')
    .custom((arr: any[]) => {
      if (!Array.isArray(arr)) return false;
      const invalid = arr.filter(s => !SENSOR_TYPES.includes(s as any));
      if (invalid.length > 0) {
        throw new Error(`Invalid sensors: ${invalid.join(', ')}. Allowed: ${[...SENSOR_TYPES].join(', ')}`);
      }
      return true;
    }),

  body('roomId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('roomId must be a valid MongoDB ObjectId'),
];