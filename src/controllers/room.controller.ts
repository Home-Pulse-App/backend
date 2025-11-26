import { Request, Response } from 'express';
import Home from '../models/Home';
import Room from '../models/Room';
import { Types } from 'mongoose';
import User from '../models/User';
import { error } from 'console';

export const addRoom = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { homeId } = req.params;
    const { roomName } = req.body;

    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({ error: 'Home not found' });
    }

    if (home.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden: not your home' });
    }

    const newRoom = await Room.create({
      roomName,
      homeId: new Types.ObjectId(homeId),
      devices: [],
    });

    home.rooms.push(newRoom._id);
    await home.save();

    return res.status(201).json({
      message: 'Room created successfully',
      room: newRoom,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
