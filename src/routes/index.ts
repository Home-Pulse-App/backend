import { Router } from 'express';

import usersRoutes from './users.routes';
import authRoutes from './auth.routes';
import { auth } from '../middlewares/auth.middleware';
import homesRoutes from './homes.routes';
import roomsRoutes from './rooms.routes';
import devicesRoutes from './devices.routes';
import sensorsRoutes from './sensors.routes';

const router = Router();

//test is alive
router.get('/api', (req, res) => {
  res.status(200).send('It is alive! 🧟');
});

//Auth-Login
router.use('/api/auth', authRoutes);

// Users
router.use('/api/users', usersRoutes);

// Homes
router.use('/api/homes', homesRoutes);

// Rooms
router.use('/api/homes/:homeId/rooms', roomsRoutes);

// Devices
router.use('/api/devices', auth, devicesRoutes);

// Data
router.use('/api/device-data', auth, sensorsRoutes);

export default router;
