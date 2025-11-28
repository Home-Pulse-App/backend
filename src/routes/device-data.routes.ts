import { Router } from 'express';
import 'dotenv/config';
import { getDeviceData, getDeviceStats, getLatestDeviceData, postDeviceData} from '../controllers/device-data.controller';
import { auth } from '../middlewares/auth.middleware';
import { validatorSensor } from '../validators/device-data.validator';

const router = Router();

/**
 * @openapi
 * /device-data/{device}:
 *   get:
 *     summary: Get device sensor data with pagination
 *     description: Retrieves historical sensor data for a specific device. Supports pagination, date filtering, and custom sorting.
 *     tags:
 *       - Device Data
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: device
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID (ObjectId) or deviceName
 *         example: iot1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           minimum: 1
 *           maximum: 1000
 *         description: Number of records to return
 *         example: 50
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of records to skip (for pagination)
 *         example: 0
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *         example: -createdAt
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter records from this date (ISO 8601 format)
 *         example: 2025-01-01T00:00:00Z
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter records until this date (ISO 8601 format)
 *         example: 2025-01-31T23:59:59Z
 *     responses:
 *       200:
 *         description: Device data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     device:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 507f1f77bcf86cd799439011
 *                         deviceName:
 *                           type: string
 *                           example: iot1
 *                         type:
 *                           type: string
 *                           example: esp32-generic
 *                     readings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439012
 *                           userId:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439013
 *                           deviceId:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439011
 *                           sensorsData:
 *                             type: object
 *                             description: Contains all sensor readings (fields vary by device)
 *                             example:
 *                               temperature: 23.5
 *                               humidity: 65
 *                               light: 75
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-01-15T10:30:00Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-01-15T10:30:00Z
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 500
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         skip:
 *                           type: integer
 *                           example: 0
 *                         hasMore:
 *                           type: boolean
 *                           example: true
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 10
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Device not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error fetching device data
 *                 error:
 *                   type: string
 *   post:
 *     summary: Post a device sensor data
 *     description: Update a sensor value for a specific device by publishing to MQTT
 *     tags:
 *       - Device Data
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: device
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID (ObjectId) or deviceName
 *         example: iot1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sensor
 *               - value
 *             properties:
 *               sensor:
 *                 type: string
 *                 description: Name of the sensor to update
 *                 example: relay
 *               value:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: boolean
 *                 description: Value to set (on/off/1/0/true/false for switches, numeric for sensors)
 *                 example: on
 *               qos:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 2
 *                 default: 1
 *                 description: MQTT Quality of Service level
 *                 example: 1
 *           examples:
 *             onOffSensor:
 *               summary: On/Off sensor (relay)
 *               value:
 *                 sensor: relay
 *                 value: on
 *             numericSensor:
 *               summary: Numeric sensor (brightness)
 *               value:
 *                 sensor: brightness
 *                 value: 75
 *             booleanSensor:
 *               summary: Boolean sensor
 *               value:
 *                 sensor: light
 *                 value: true
 *                 qos: 2
 *     responses:
 *       200:
 *         description: Device data published successfully
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
 *                   example: Device data published successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     topic:
 *                       type: string
 *                       description: MQTT topic where the message was published
 *                       example: switch/iot1/relay/set
 *                     value:
 *                       type: string
 *                       description: Published value (1 for on, 0 for off, or numeric)
 *                       example: "1"
 *                     qos:
 *                       type: integer
 *                       description: QoS level used
 *                       example: 1
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: sensor
 *                       message:
 *                         type: string
 *                         example: Sensor is required
 *             examples:
 *               missingSensor:
 *                 summary: Missing sensor field
 *                 value:
 *                   success: false
 *                   errors:
 *                     - field: sensor
 *                       message: Sensor is required
 *               invalidValue:
 *                 summary: Invalid value for sensor type
 *                 value:
 *                   success: false
 *                   errors:
 *                     - field: value
 *                       message: Sensor 'relay' only accepts on/off values
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to publish device data
 *                 details:
 *                   type: string
 *                   example: MQTT broker connection failed
*/

router.get('/:device', auth, getDeviceData);
router.post('/:device',auth,validatorSensor, postDeviceData);

/**
 * @openapi
 * /device-data/{device}/latest:
 *   get:
 *     summary: Get latest sensor reading from device
 *     description: Retrieves the most recent sensor data reading for a specific device
 *     tags:
 *       - Device Data
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: device
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID (ObjectId) or deviceName
 *         example: iot1
 *     responses:
 *       200:
 *         description: Latest reading retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     device:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 507f1f77bcf86cd799439011
 *                         deviceName:
 *                           type: string
 *                           example: iot1
 *                         type:
 *                           type: string
 *                           example: esp32-generic
 *                     latest:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 507f1f77bcf86cd799439012
 *                         userId:
 *                           type: string
 *                           example: 507f1f77bcf86cd799439013
 *                         deviceId:
 *                           type: string
 *                           example: 507f1f77bcf86cd799439011
 *                         sensorsData:
 *                           type: object
 *                           description: Latest sensor readings
 *                           example:
 *                             temperature: 24.2
 *                             humidity: 62
 *                             light: 80
 *                             switch1: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-01-15T14:25:00Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-01-15T14:25:00Z
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Device not found or no data available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No data found for this device
 *       500:
 *         description: Internal server error
*/


// Get latest reading
router.get('/:device/latest', auth, getLatestDeviceData);

/**
 * @openapi
 * /device-data/{device}/stats:
 *   get:
 *     summary: Get statistical analysis of sensor data
 *     description: Calculates average, min, max, and count for a specific sensor field over a time period
 *     tags:
 *       - Device Data
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: device
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID (ObjectId) or deviceName
 *         example: iot1
 *       - in: query
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - temperature
 *             - humidity
 *             - pressure
 *             - light
 *             - soilMoisture
 *             - airQuality
 *             - co2
 *             - pm25
 *             - power
 *             - voltage
 *             - current
 *         description: Sensor field to analyze
 *         example: temperature
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *           default: day
 *         description: Time period for statistics calculation
 *         example: day
 *     responses:
 *       200:
 *         description: Statistics calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     device:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 507f1f77bcf86cd799439011
 *                         deviceName:
 *                           type: string
 *                           example: iot1
 *                         type:
 *                           type: string
 *                           example: esp32-generic
 *                     field:
 *                       type: string
 *                       example: temperature
 *                     period:
 *                       type: string
 *                       example: day
 *                     stats:
 *                       type: object
 *                       properties:
 *                         average:
 *                           type: number
 *                           example: 23.4
 *                         minimum:
 *                           type: number
 *                           example: 18.5
 *                         maximum:
 *                           type: number
 *                           example: 28.9
 *                         count:
 *                           type: integer
 *                           example: 144
 *                         latest:
 *                           type: number
 *                           example: 24.2
 *                     dateRange:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-01-14T14:25:00Z
 *                         end:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-01-15T14:25:00Z
 *       400:
 *         description: Field parameter required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Device not found or no data available for field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No temperature data found for this device in the specified period
 *       500:
 *         description: Internal server error
*/

// Get statistics
router.get('/:device/stats', auth, getDeviceStats);



export default router;