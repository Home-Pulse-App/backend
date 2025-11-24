import { Router } from 'express';
import 'dotenv/config';
import { login } from './controller/auth.controller';
import { auth } from './middleware/auth.middleware';

const router = Router();

// Testing 🧪
router.get('/', (req, res)=>{res.status(200).json('It is alive! 🧟')});

// Users
//TODO add CRUD to users
router.post('/login',login);
router.get('/profile',auth)

// Homes
//TODO add CRUD to Homes

// Rooms
//TODOS add CRUD to Rooms

// Devices
//TODOS add CRUD to Devices


export default router;
