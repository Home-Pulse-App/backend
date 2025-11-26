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
router.post('/homes/:homeId/rooms', auth, addRoom);

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

router.get('/homes/:homeId/rooms', auth, getRooms);

export default router;
