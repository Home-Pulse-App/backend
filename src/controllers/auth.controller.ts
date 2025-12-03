import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { Request, Response } from 'express';
import { subscribeToDevices } from '../utils/mqtt.subscribes';
import { IDevice } from '../models/Device';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate('devices').exec();

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  subscribeToDevices(user.devices as unknown as IDevice[]);
  const ResponseData = {
    token,
    user: user.userName
  };

  res.json({ ResponseData });
};
