import { Router } from "express";
import { getRoom, updateRoom } from "../controllers/room.controller";


const router = Router();

/**
 * @openapi
 * /room/{roomId}:
 *   get:
 *     summary: Get a room from a home
 *     description: Gets the specified room.
 *     tags:
 *       - Rooms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room fetched successfully
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a room
 *     description: Updates the specified room.
 *     tags:
 *       - Rooms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               viewDevices:
 *                 type: array
 *                 items:
 *                   type: string
 *               viewSplat:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */

router.get('/:roomId', getRoom);
router.put('/:roomId', updateRoom);

export default router;