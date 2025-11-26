import { Router } from 'express';

import usersRoutes from './users.routes';
import authRoutes from './auth.routes';
import { auth } from '../middlewares/auth.middleware';
import homesRoutes from './homes.routes';
// import roomsRoutes from './rooms.routes';
import devicesRoutes from './devices.routes';

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
// router.use('/rooms', roomsRoutes);

// Devices
router.use('/api/device', auth, devicesRoutes);

export default router;
