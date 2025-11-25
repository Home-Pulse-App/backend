import { Router } from 'express';
import 'dotenv/config';
import { login } from '../controllers/auth.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *    post:
 *     summary: Login user and return JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *
 * /api/auth/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []   # ✅ Requires JWT
 *     responses:
 *       200:
 *         description: User profile returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *       401:
 *         description: Missing or invalid token
 */

router.post('/login',login);
router.get('/profile',auth);

export default router;