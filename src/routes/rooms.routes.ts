import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { addRoom } from '../controllers/room.controller';

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

export default router;
