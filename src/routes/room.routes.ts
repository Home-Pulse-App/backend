import { Router } from "express";
import { getRoom, updateRoom } from "../controllers/room.controller";
import { getSplatFile } from "../controllers/splat.controller";


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
 *                 description: Base64 encoded splat file
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 * 
 * /room/{roomId}/splat:
 *   get:
 *     summary: Get splat file for a room
 *     description: Downloads the splat file associated with the room
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
 *         description: Splat file downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Room or splat file not found
 *       500:
 *         description: Internal server error
 */

router.get('/:roomId', getRoom);
router.put('/:roomId', updateRoom);
router.get('/:roomId/splat', getSplatFile);

export default router;