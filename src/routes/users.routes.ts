import 'dotenv/config';
import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { validatorCreateUser, validatorUpdateUser } from '../validators/user.validator';
import { createNewUser } from '../controllers/user.controller';

const router = Router();

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user in the system. Requires valid user data.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: Secret123!
 *             additionalProperties: false
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 64a7f1c9e8b2c1a2b3c4d5e6
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: Conflict – email already exists
 *       500:
 *         description: Internal server error
 * 
 *   put:
 *     summary: Update an existing user
 *     description: Updates user information. Only the authenticated user can modify a profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.updated@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Only required if the user wants to change the password
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: Only admins can change the role
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – not allowed to modify this user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post('/',validatorCreateUser, createNewUser);
router.put('/',auth,validatorUpdateUser);

export default router;
