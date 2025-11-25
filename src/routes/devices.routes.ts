import { Router } from 'express';
import 'dotenv/config';
import { validateCreateDevice } from '../validators/device.validator';
import { postDevice } from '../controllers/device.controller';

const router = Router();

/**
 * @openapi
 *  /:
 *   post:
 *     summary: Register a new IoT device (ESP32)
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
 *               - deviceId
 *               - deviceName
 *             properties:
 *               deviceId:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: esp32-livingroom-01
 *                 description: Unique identifier for the device (e.g. MAC-based or custom)
 *               deviceName:
 *                 type: string
 *                 example: Living Room Sensor
 *                 description: Human-readable name
 *               type:
 *                 type: string
 *                 enum: [esp32]
 *                 default: esp32
 *                 description: Device type (for future expansion)
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
 *                 example: ["temperature", "humidity", "light","switch1"]
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
 */

router.post('/',validateCreateDevice,postDevice);


export default router;