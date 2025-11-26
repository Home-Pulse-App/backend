import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Home from './models/Home';

async function seed() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected.');

    // creates mock user
    const email = 'test@example.com';
    const plainPassword = 'secret123';

    let user = await User.findOne({ email });

    if (!user) {
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      user = await User.create({
        userName: 'Test User',
        email,
        passwordHash,
        homes: [],
        devices: [],
      });

      console.log('Mock user created:', user.email);
    } else {
      console.log('User already exists:', email);
    }

    // creates mock home
    let home = await Home.findOne({ userId: user._id });

    if (!home) {
      home = await Home.create({
        homeName: 'Test Home',
        userId: user._id,
        rooms: [],
      });

      console.log('Mock home created:', home.homeName);
    } else {
      console.log('Home already exists:', home.homeName);
    }

    console.log('✅ Seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
