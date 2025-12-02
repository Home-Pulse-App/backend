import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Home from '../models/Home';
import Room from '../models/Room';
import Device from '../models/Device';

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
      viewDevices: [],
      viewSplat: '',
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

export const getRooms = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { homeId } = req.params;

    const home = await Home.findById(homeId);

    if (!home) {
      return res.status(404).json({ error: 'Home not found' });
    }

    if (home.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not your home' });
    }

    const rooms = await Room.find({ homeId });

    return res.status(200).json({
      message: 'Rooms fetched successfully',
      rooms,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
export const getRoom = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.status(200).json({
      message: 'Room fetched successfully',
      room,
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { homeId, roomId } = req.params;

    const home = await Home.findById(homeId);

    if (!home) {
      return res.status(404).json({ error: 'Home not found' });
    }

    if (home.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not your home' });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await Room.findByIdAndDelete(roomId);

    home.rooms = home.rooms.filter((id) => id.toString() !== roomId);
    await home.save();

    return res.status(200).json({
      message: 'Room deleted successfully',
      roomId,
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { homeId, roomId } = req.params;
    const { viewDevices, viewSplat } = req.body;

    const home = await Home.findById(homeId);

    if (!home) {
      return res.status(404).json({ error: 'Home not found' });
    }

    if (home.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not your home' });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    if (viewDevices) {
      room.viewDevices = viewDevices;
    }
    if (viewSplat) {
      room.viewSplat = viewSplat;
    }
    await room.save();

    return res.status(200).json({
      success: true,
      message: `Room ${room.roomName} updated successfully`,
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const connectDevice = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { homeId, roomId, deviceId } = req.params;

    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({ error: 'Home not found' });
    }

    if (home.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not your home' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (device.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not your device' });
    }

    if (room.devices.includes(device._id)) {
      return res.status(400).json({ error: 'Device already connected' });
    }

    room.devices.push(device._id);
    await room.save();

    return res.status(200).json({
      message: 'Device connected successfully',
      room,
    });
  } catch (error) {
    console.error('Error connecting device:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const disconnectDevice = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { homeId, roomId, deviceId } = req.params;

    const home = await Home.findById(homeId);

    if (!home) return res.status(404).json({ error: 'Home not found' });
    if (home.userId.toString() !== userId) return res.status(403).json({ error: 'Not your home' });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const device = await Device.findById(deviceId);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    if (device.userId.toString() !== userId)
      return res.status(403).json({ error: 'Not your device' });

    if (!room.devices.includes(device._id)) {
      return res.status(400).json({ error: 'Device is not connected to this room' });
    }

    room.devices = room.devices.filter((d) => !d.equals(device._id));
    await room.save();

    return res.status(200).json({
      message: 'Device disconnected successfully',
      room,
    });
  } catch (error) {
    console.error('Error disconnecting device:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRoomDevices = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId;
    const userId = tokenPayload.id;

    const { homeId, roomId } = req.params;

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ message: 'Home not found' });
    if (home.userId.toString() !== userId)
      return res.status(403).json({ message: 'Not your home' });

    const room = await Room.findById(roomId).populate('devices');
    if (!room) return res.status(404).json({ message: 'Room not found' });

    res.status(200).json({
      success: true,
      message: 'Devices fetched successfully',
      data: {
        devices: room.devices,
      },
    });
  } catch (error) {
    console.error('getRoomDevices error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
