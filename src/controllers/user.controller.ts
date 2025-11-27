import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';

export async function createNewUser(req: Request, res: Response) {
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
    const { userName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password,14);
    
    const newUser : IUser = new User ({
      userName: userName,
      email: email,
      passwordHash: hashedPassword,
      homes: [],
      devices: [],
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error: any) {
    console.error('postDevice error:', error);

    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: `User with userId "${req.body.userId}" already exists`,
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

export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = res.locals.userId.id;

    const dbresponse = await User.deleteOne({ _id: userId });

    if (dbresponse.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    //TODO cascade delete the homes and the devices

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('postDevice error:', error);

    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: `User with userId "${req.body.userId}" not exist on DB`,
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

export async function updateUser(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const userId = res.locals.userId.id;
    const { userName, email, password } = req.body;

    const user = await User.findById({ _id: userId._id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with userId "${userId.userName}" not found`,
      });
    }

    if (userName !== undefined) user.userName = userName;
    if (email !== undefined) user.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 14);
      user.passwordHash = hashedPassword;
    }

    // Optionally allow updating homes/devices if needed later
    // if (homes !== undefined) user.homes = homes;
    // if (devices !== undefined) user.devices = devices;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('updateUser error:', error);

    // Handle duplicate email or other unique constraints (if email has unique index)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(409).json({
        success: false,
        message: `A user with this ${field} "${value}" already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
