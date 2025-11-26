import { Request, Response } from 'express';
import Home from '../models/Home';
import User from '../models/User';

export const registerHome = async (req: Request, res: Response) => {
  try {
    const tokenPayload = res.locals.userId as { id: string; email: string };
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
