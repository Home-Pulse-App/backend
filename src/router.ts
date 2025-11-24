import { Router } from 'express';
import 'dotenv/config';

const router = Router();

// Testing 🧪
router.get('/', (req, res)=>{res.status(200).json('It is alive! 🧟')});

// Users
//TODO add CRUD to users


// Homes
//TODO add CRUD to Homes

// Rooms
//TODOS add CRUD to Rooms

// Devices
//TODOS add CRUD to Devices


export default router;
