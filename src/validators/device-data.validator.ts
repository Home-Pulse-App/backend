const { body, param, validationResult } = require('express-validator');

// Define sensor types
const onOffOnlySensors = ['relay', 'light', 'switch', 'alarm'];
const numericSensors = ['temperature', 'humidity', 'dimmer', 'speed', 'volume'];

export const validateSensorValue = (value: typeof onOffOnlySensors | typeof numericSensors, { req }) => {
  const sensor = req.body.sensor;
  
  if (!sensor) {
    return true; // Let the sensor validation handle this
  }
  
  const sensorLower = sensor.toLowerCase();
  const normalizedValue = String(value).toLowerCase();
  
  if (onOffOnlySensors.includes(sensorLower)) {
    if (!['on', 'off', '1', '0', 'true', 'false'].includes(normalizedValue)) {
      throw new Error(`Sensor '${sensor}' only accepts on/off values`);
    }
  }

  else if (numericSensors.includes(sensorLower)) {
    if (!['on', 'off', '1', '0', 'true', 'false'].includes(normalizedValue)) {
        throw new Error(`Sensor '${sensor}' requires a numeric value or on/off`);
      }
    }
  return true;
};

export const validatorSensor = [
  param('device')
    .trim()
    .notEmpty()
    .withMessage('Device name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Device name must be between 1 and 50 characters'),
  
  body('sensor')
    .trim()
    .notEmpty()
    .withMessage('Sensor is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Sensor name must be between 1 and 50 characters'),
  
  body('value')
    .exists()
    .withMessage('Value is required')
    .custom(validateSensorValue),

  body('type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Type must be between 1 and 50 characters'),
  
  body('qos')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('QoS must be 0, 1, or 2'),
];