import { Router } from 'express';
import 'dotenv/config';
import { validateCreateDevice, validateDeviceId } from '../validators/device.validator';
import { getDevices, postDevice, deleteDevice } from '../controllers/device.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /devices:
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
 *                 description: Unique identifier for the device (e.g., name given by manufacturer)
 *               type:
 *                 type: string
 *                 enum: [esp32-generic, raspberry-pi]
 *                 default: esp32-generic
 *                 description: Device type (for now only esp32-generic works)
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
 *         description: Device created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     device:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         deviceName:
 *                           type: string
 *                         type:
 *                           type: string
 *                         state:
 *                           type: string
 *                         sensors:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: Device already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', validateCreateDevice, postDevice);

/**
 * @openapi
 * /devices:
 *   get:
 *     summary: Get all devices for the authenticated user
 *     description: Returns a list of all devices that belong to the currently authenticated user.
 *     tags:
 *       - Device
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Devices fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Devices fetched successfully
 *                 devices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 69283978a8abca275407d1de
 *                       deviceName:
 *                         type: string
 *                         example: Smart Lamp
 *                       type:
 *                         type: string
 *                         example: light
 *                       state:
 *                         type: string
 *                         example: on
 *                       roomId:
 *                         type: string
 *                         nullable: true
 *                         example: 69283978a8abca275407d1df
 *       401:
 *         description: Unauthorized — invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, getDevices);

/**
 * @openapi
 * /devices/{deviceId}:
 *   delete:
 *     summary: Delete a device by ID
 *     tags:
 *       - Device
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the device to delete
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *       403:
 *         description: Forbidden — user is not owner of the device
 *       404:
 *         description: Device or user not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:deviceId', auth, deleteDevice);

export default router;
