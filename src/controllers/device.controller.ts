import { NextFunction, Request, Response } from 'express';
import Device, { IDevice } from '../models/Device';
import { validationResult } from 'express-validator';
import User from '../models/User';

export async function postDevice(req: Request, res: Response): Promise<void> {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
    return;
  }

  try {
    const {
      deviceName,
      type,
      sensors = [],
    } = req.body;
    const user = res.locals.userId;

    const registerUser = await User.findById(user.userId);
    if (!registerUser) {
      res.status(409).json({
        success: false,
        message: `Can't find the user ${user}`,
      });
      return;
    }

    const existingDevice = await Device.findOne({ deviceName });
    if (existingDevice) {
      res.status(409).json({
        success: false,
        message: `Device with Name "${deviceName}" already exists`,
      });
      return;
    }
    const lastDevice = await Device.findOne().sort({ deviceId: -1 });
    const nextId = lastDevice? lastDevice.deviceId+1 : 1;

    const newDevice: IDevice = new Device({
      deviceId: nextId,
      deviceName: deviceName.trim(),
      sensors,
      type,
      state: 'OFFLINE',
    });

    await newDevice.save(); //create a new device in the collection
    
    //update the devices of the user
    await User.findByIdAndUpdate(
      user.userId,
        { $push: {devices: newDevice}},
        {new: true}
    );

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: {
        device: newDevice,
      },
    });
  } catch (error: any) {
    console.error('postDevice error:', error);
    
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: `Device with deviceId "${req.body.deviceId}" already exists`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function getDevices(req: Request, res: Response): Promise<void> {

  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   res.status(400).json({
  //     success: false,
  //     message: 'Validation failed',
  //     errors: errors.array(),
  //   });
  //   return;
  // }

  // try {
  //   const {
  //     deviceName,
  //     type,
  //     sensors = [],
  //   } = req.body;

  //   const existingDevice = await Device.findOne({ deviceName });
  //   if (existingDevice) {
  //     res.status(409).json({
  //       success: false,
  //       message: `Device with Name "${deviceName}" already exists`,
  //     });
  //     return;
  //   }
  //   const lastDevice = await Device.findOne().sort({ deviceId: -1 });
  //   const nextId = lastDevice? lastDevice.deviceId+1 : 1;

  //   const newDevice: IDevice = new Device({
  //     deviceId: nextId,
  //     deviceName: deviceName.trim(),
  //     sensors,
  //     type,
  //     state: 'OFFLINE',
  //   });

  //   await newDevice.save();

  //   res.status(201).json({
  //     success: true,
  //     message: 'Device registered successfully',
  //     // data: {
  //     //   device: newDevice,
  //     // },
  //   });
  // } catch (error: any) {
  //   console.error('postDevice error:', error);
    
  //   if (error.code === 11000) {
  //     res.status(409).json({
  //       success: false,
  //       message: `Device with deviceId "${req.body.deviceId}" already exists`,
  //     });
  //     return;
  //   }

  //   res.status(500).json({
  //     success: false,
  //     message: 'Internal server error',
  //     error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  //   });
  // }
}