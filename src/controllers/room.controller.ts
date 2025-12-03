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
      viewSplatFileId: null,
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

    // Validate roomId
    if (!roomId || roomId === 'null' || roomId === 'undefined' || !Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID provided',
      });
    }

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

    const { roomId } = req.params;
    const { viewDevices, viewSplat } = req.body;

    // Validate roomId
    if (!roomId || roomId === 'null' || roomId === 'undefined' || !Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID provided',
      });
    }

    // If only updating viewDevices, use findByIdAndUpdate to avoid version conflicts
    if (viewDevices && !viewSplat) {
      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        { $set: { viewDevices } },
        { new: true, runValidators: true }
      );

      if (!updatedRoom) {
        return res.status(404).json({ error: 'Room not found' });
      }

      return res.status(200).json({
        success: true,
        message: `Room ${updatedRoom.roomName} updated successfully`,
        data: {
          roomId: updatedRoom._id,
          viewSplatFileId: updatedRoom.viewSplatFileId,
        },
      });
    }

    // For viewSplat updates or combined updates, use retry logic
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any;

    while (retryCount < maxRetries) {
      try {
        const room = await Room.findById(roomId);

        if (!room) {
          return res.status(404).json({ error: 'Room not found' });
        }

        // Update viewDevices if provided
        if (viewDevices) {
          room.viewDevices = viewDevices;
        }

        // Handle viewSplat file upload to GridFS
        if (viewSplat) {
          const { getGridFSBucket } = await import('../utils/gridfs');
          const bucket = getGridFSBucket();

          // Delete old file if exists
          if (room.viewSplatFileId) {
            try {
              await bucket.delete(room.viewSplatFileId);
            } catch (error) {
              console.error('Error deleting old splat file:', error);
              // Continue even if delete fails
            }
          }

          // Convert base64 to buffer
          const base64Data = viewSplat.replace(/^data:.*;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          // Upload to GridFS
          const uploadStream = bucket.openUploadStream(`splat_${roomId}_${Date.now()}.splat`, {
            metadata: {
              roomId: roomId,
              uploadedAt: new Date(),
            },
          });

          // Write buffer and wait for completion
          await new Promise<void>((resolve, reject) => {
            uploadStream.on('finish', () => resolve());
            uploadStream.on('error', (error) => reject(error));
            uploadStream.write(buffer);
            uploadStream.end();
          });

          room.viewSplatFileId = uploadStream.id as Types.ObjectId;
        }

        await room.save();

        return res.status(200).json({
          success: true,
          message: `Room ${room.roomName} updated successfully`,
          data: {
            roomId: room._id,
            viewSplatFileId: room.viewSplatFileId,
          },
        });
      } catch (error: any) {
        // Check if it's a version error
        if (error.name === 'VersionError') {
          lastError = error;
          retryCount++;
          console.log(`Version conflict, retrying... (${retryCount}/${maxRetries})`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
          continue;
        }
        // If it's not a version error, throw it
        throw error;
      }
    }

    // If we exhausted all retries
    console.error('Max retries reached for version conflict:', lastError);
    return res.status(409).json({
      success: false,
      error: 'Conflict: Document was modified by another request. Please try again.',
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
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

    device.connectedToRoom = room._id;
    await device.save();

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

    device.connectedToRoom = null;
    await device.save();

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
