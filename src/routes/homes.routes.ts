import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { registerHome } from '../controllers/home.controllers';

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

export default router;
