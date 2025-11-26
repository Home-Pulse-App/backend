import { Router } from 'express';
import 'dotenv/config';
import { validateCreateDevice, validateDeviceId } from '../validators/device.validator';
import { getDevices, postDevice } from '../controllers/device.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 *  /device:
 *   post:
 *     summary: Register a new IoT device
 *     description: Creates a new device in the system. Usually called by the ESP32 on first boot or via admin panel.
 *     tags:
 *       - Device
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceName
 *               - type
 *               - sensors
 *             properties:
 *               deviceName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: iot1
 *                 description: Unique identifier for the device (e.g. Name given by manufacter)
 *               type:
 *                 type: string
 *                 enum: [esp32-generic | raspberry-pi]
 *                 default: esp32-generic
 *                 description: Device type (for now only working esp32-generic)
 *               sensors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - temperature
 *                     - humidity
 *                     - pressure
 *                     - light
 *                     - motion
 *                     - door
 *                     - window
 *                     - soilMoisture
 *                     - airQuality
 *                     - co2
 *                     - pm25
 *                     - switch1
 *                     - switch2
 *                     - switch3
 *                     - switch4
 *                     - power
 *                     - voltage
 *                     - current
 *                 example: ["temperature", "humidity", "light","switch1","switch2"]
 *                 description: List of sensors this device has
 *     responses:
 *       201:
 *         description: Device created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       400:
 *         description: Validation error
 *       409:
 *         description: Device already exists
 *       500:
 *         description: Internal server error
 * 
 *   get:
 *     summary: Get devices from the user list
 *     tags:
 *       - Device array
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Users devices list
 *         content:
 *           application/json:
 *             schema:
 *               type: Array
 *               properties:
 *                 deviceName:
 *                   type: string
 *                 type:
 *                   type: string
 *                 state:
 *                   type: string
 *                 sensors:
 *                   type: string
 *       401:
 *         description: Missing or invalid token
 */

router.post('/',validateCreateDevice,postDevice);
router.get('/', auth, getDevices);
router.get('/:device',auth,getDeviceDAta);


export default router;