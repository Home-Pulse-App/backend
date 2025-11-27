import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import {
  registerHome,
  getUserHomes,
  getSingleHome,
  deleteHome,
} from '../controllers/home.controllers';

const router = Router();

/**
 * @openapi
 * /homes:
 *   post:
 *     summary: Register a new home
 *     description: Creates a new home and links it to the authenticated user.
 *     tags:
 *       - Homes
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - homeName
 *             properties:
 *               homeName:
 *                 type: string
 *                 example: My Sweet Home
 *     responses:
 *       201:
 *         description: Home created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Home created successfully
 *                 home:
 *                   type: object
 *       400:
 *         description: Missing homeName
 *       401:
 *         description: Unauthorized — invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/', auth, registerHome);

/**
 * @openapi
 * /homes:
 *   get:
 *     summary: Get all homes of the user
 *     tags:
 *       - Homes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Homes fetched successfully
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
 *                   example: Homes fetched successfully
 *                 homes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 69283978a8abca275407d1de
 *                       homeName:
 *                         type: string
 *                         example: My Sweet Home
 *                       rooms:
 *                         type: array
 *                         items:
 *                           type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, getUserHomes);

/**
 * @swagger
 * /homes/{homeId}:
 *   get:
 *     summary: Get a single home by ID
 *     tags: [Homes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the home to retrieve
 *     responses:
 *       200:
 *         description: Home fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 home:
 *                   $ref: '#/components/schemas/Home'
 *       403:
 *         description: User does not own this home
 *       404:
 *         description: Home not found
 *       500:
 *         description: Internal server error
 */
router.get('/:homeId', auth, getSingleHome);

/**
 * @openapi
 * /homes/{homeId}:
 *   delete:
 *     summary: Delete a home
 *     description: Deletes a home and all its associated rooms and devices.
 *     tags:
 *       - Homes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the home to delete
 *     responses:
 *       200:
 *         description: Home deleted successfully
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
 *                   example: Home deleted successfully
 *       403:
 *         description: Forbidden — user is not owner of the home
 *       404:
 *         description: Home not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:homeId', auth, deleteHome);

export default router;
