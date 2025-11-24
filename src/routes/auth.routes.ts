import { Router } from 'express';
import 'dotenv/config';
import { login } from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: 
 * description: 
 * tags:
 * - Authentication
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/LoginRequest'
 * responses:
 * '200':
 * description: 
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/LoginSuccessResponse'
 * '401':
 * description: Неверные учетные данные.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Invalid email or password
 * '500':
 * description: Ошибка сервера.
 */

router.post('/login',login);
router.get('/profile',auth);

export default router;