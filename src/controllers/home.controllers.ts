import { Request, Response } from 'express';
import Home from '../models/Home';
import User from '../models/User';
import Room from '../models/Room';
import Device from '../models/Device';

export const registerHome = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { homeName } = req.body;

    if (!homeName) {
      return res.status(400).json({ error: 'Home Name is required' });
    }

    const newHome = await Home.create({
      homeName,
      userId,
      rooms: [],
    });

    await User.findByIdAndUpdate(userId, {
      $push: { homes: newHome._id },
    });

    return res.status(201).json({
      message: 'Home created successfully',
      home: newHome,
    });
  } catch (error) {
    console.error('Error creating home:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserHomes = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const user = await User.findById(userId).populate('homes');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.homes || user.homes.length === 0) {
      return res.status(200).json({ success: true, message: 'No homes found', homes: [] });
    }

    res.status(200).json({
      success: true,
      message: 'Homes fetched successfully',
      homes: user.homes,
    });
  } catch (error) {
    console.error('getUserHomes error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteHome = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { homeId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({ success: false, message: 'Home not found' });
    }

    if (!user.homes.includes(homeId as any)) {
      return res.status(403).json({ success: false, message: 'Not your home' });
    }

    const rooms = await Room.find({ homeId });
    for (const room of rooms) {
      await Device.updateMany(
        { _id: { $in: room.devices } },
        { $unset: { roomId: '' } }, // disconnect all devices of the room
      );
      await Room.findByIdAndDelete(room._id); // delete the room
    }

    await Home.findByIdAndDelete(homeId); // delelte the home

    user.homes = user.homes.filter((id) => id.toString() !== homeId); // delete home from user table
    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'Home and all rooms deleted, devices disconnected' });
  } catch (error) {
    console.error('deleteHome error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSingleHome = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { homeId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.homes.includes(homeId as any)) {
      return res.status(403).json({ success: false, message: 'Not your home' });
    }

    const home = await Home.findById(homeId).populate('rooms');
    if (!home) {
      return res.status(404).json({ success: false, message: 'Home not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Home fetched successfully',
      home,
    });
  } catch (error) {
    console.error('getSingleHome error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
