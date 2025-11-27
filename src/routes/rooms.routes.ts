import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { addRoom, getRooms } from '../controllers/room.controller';

const router = Router();

/**
 * @openapi
 * /homes/{homeId}/rooms:
 *   post:
 *     summary: Add a new room to a home
 *     description: Creates a new room in the specified home.
 *     tags:
 *       - Rooms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: homeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomName
 *             properties:
 *               roomName:
 *                 type: string
 *                 example: Living Room
 *     responses:
 *       201:
 *         description: Room created successfully
 *       400:
 *         description: Missing roomName
 *       403:
 *         description: Forbidden — user is not owner of the home
 *       404:
 *         description: Home not found
 *       500:
 *         description: Interna
 */
router.post('/', auth, addRoom);

/**
 * @openapi
 * /homes/{homeId}/rooms:
 *   get:
 *     summary: Get all rooms for a home
 *     description: Returns the list of rooms belonging to a specific home.
 *     tags:
 *       - Rooms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: homeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the home
 *     responses:
 *       200:
 *         description: Rooms fetched successfully
 *       403:
 *         description: Forbidden — user is not owner of the home
 *       404:
 *         description: Home not found
 *       500:
 *         description: Internal server error
 */

router.get('/', auth, getRooms);

<<<<<<< Updated upstream
=======
/**
 * @openapi
 * /homes/{homeId}/rooms/{roomId}/devices:
 *   get:
 *     summary: Get all devices of a room
 *     description: Returns the list of devices connected to a specific room.
 *     tags:
 *       - Rooms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the home
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the room
 *     responses:
 *       200:
 *         description: Devices fetched successfully
 *       403:
 *         description: Forbidden — user is not owner of the home
 *       404:
 *         description: Home or room not found
 *       500:
 *         description: Internal server error
 */
router.get('/:roomId/devices', auth, getRoomDevices);

/**
 * @openapi
 * /homes/{homeId}/rooms/{roomId}/connect/{deviceId}:
 *   post:
 *     summary: Connect a device to a room
 *     tags: [Rooms]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: deviceId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Device connected successfully
 *       400:
 *         description: Device already connected
 *       404:
 *         description: Not found
 */
router.post('/:roomId/connect/:deviceId', auth, connectDevice);

/**
 * @openapi
 * /homes/{homeId}/rooms/{roomId}/disconnect/{deviceId}:
 *   delete:
 *     summary: Disconnect a device from a room
 *     tags: [Rooms]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the home
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the room
 *       - in: path
 *         name: deviceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the device to disconnect
 *     responses:
 *       200:
 *         description: Device disconnected successfully
 *       400:
 *         description: Device is not connected to this room
 *       403:
 *         description: Not your home or device
 *       404:
 *         description: Home, room, or device not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:roomId/disconnect/:deviceId', auth, disconnectDevice);

/**
 * @openapi
 * /homes/{homeId}/rooms/{roomId}:
 *   delete:
 *     summary: Delete a room from a home
 *     description: Deletes the specified room.
 *     tags:
 *       - Rooms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       403:
 *         description: Forbidden — user is not owner of the home
 *       404:
 *         description: Room or Home not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:roomId', auth, deleteRoom);

>>>>>>> Stashed changes
export default router;
