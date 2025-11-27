import {Request, Response } from 'express';
import Device, { IDevice } from '../models/Device';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { subscribeToDevice, subscribeToDevices } from '../utils/mqtt.subscribes';

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
    const { deviceName, type, sensors = [] } = req.body;
    const user = res.locals.userId;

    const registerUser = await User.findById(user.id);
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

    const newDevice: IDevice = new Device({
      deviceName: deviceName.trim(),
      sensors,
      type,
      state: 'OFFLINE',
    });

    console.log('newDevice:',newDevice);
    //update the devices of the user
    const userResponse =  await User.findByIdAndUpdate( user.id, { $push: { devices: newDevice } });
    console.log(userResponse);
    if(!userResponse) {
      res.status(409).json({
        success: false,
        message: `I cant update the user Devices Array`,
      });
      return;
    }
    await newDevice.save(); //create a new device in the collection


    subscribeToDevice(newDevice);

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
  try {
    const user = res.locals.userId;

    const registerUser = await User.findById(user.id).populate('devices').exec();

    if (!registerUser) {
      res.status(409).json({
        success: false,
        message: `Can't find the user ${user}`,
      });
      return;
    }

    if (!registerUser.devices[0]) {
      res.status(204).json({
        success: false,
        message: `No devices register to this user`,
      });
      return;
    }

    subscribeToDevices(registerUser.devices as unknown as IDevice[]);

    res.status(200).json({
      success: true,
      message: 'Device registered successfully',
      data: {
        devices: registerUser.devices,
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

// export async function getDeviceDAta(req: Request, res: Response): Promise<void> {
//   try {
//     const { deviceName } = req.params;
  
//     // Find the user owning this device
//     const user = await User.findOne({ "devices.deviceName": deviceName });
//     if (!user) {
//       res.status(404).json({
//         success: false,
//         message: `Device ${deviceName} not found`,
//       });
//       return;
//     }
  
//     // Subscribe to MQTT topic for live updates
//     const topic = `+/` + deviceName + `/data`; // + can match device type
//     client.subscribe(topic, (err) => {
//       if (err) console.error(`Failed to subscribe to ${topic}`, err);
//       else console.log(`Subscribed to ${topic}`);
//     });
  
//     // Get the latest device readings from MongoDB
//     const readings = await DeviceData.find({ deviceId: deviceName })
//       .sort({ createdAt: -1 }) // newest first
//       .limit(20); // last 20 readings
  
//     res.json({
//       success: true,
//       deviceName,
//       readings,
//     });
//   } catch (err) {
//     console.error('Error fetching device data:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// }