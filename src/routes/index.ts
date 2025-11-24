import { Router } from 'express';

import usersRoutes from './users.routes';
import authRoutes from './auth.routes';
// import homesRoutes from './homes.routes';
// import roomsRoutes from './rooms.routes';
// import devicesRoutes from './devices.routes';

const router = Router();

//Auth
router.use('/auth',authRoutes);

// Users
router.use('/users', usersRoutes);

// Homes
// router.use('/homes', homesRoutes);

// // Rooms
// router.use('/rooms', roomsRoutes);

// // Devices
// router.use('/devices', devicesRoutes);

export default router;
