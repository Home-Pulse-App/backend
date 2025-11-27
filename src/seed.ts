import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Home from './models/Home';
import Room from './models/Room';
import Device from './models/Device';
import mockdata from '../mockData/home-pulse.devicedatas.json';
import DeviceData from './models/DeviceData';

async function seed() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected.');

    // creates mock user
    const email = 'test@example.com';
    const plainPassword = 'Secret123!';

    let user = await User.findOne({ email });

    if (!user) {
      const passwordHash = await bcrypt.hash(plainPassword, 14);

      user = await User.create({
        userName: 'Test User',
        email,
        passwordHash,
        homes: [],
        devices: [],
      });

      console.log('Mock user created:', user.email);
    } else {
      console.log('❌ User already exists:', email);
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
      console.log('❌ Home already exists:', home.homeName);
    }

    //create mock room
    let room = await Room.findOne({homeId: home._id})

    if (!room) {
      room = await Room.create({
        roomName: 'Test room',
        homeId: user._id,
        devices: [],
      });

      console.log('Mock room created:', home.homeName);
    } else {
      console.log('❌ Room already exists:', home.homeName);
    }

    //device
    let userActual = await User.findOne({email}).populate('devices').exec();

    if (userActual){
      if (!userActual.devices[0]){
        const device = new Device( {
          deviceName: 'iot1',
          type: 'esp32-generic',
          state: 'OFFLINE',
          sensors: [  
            'temperature',
            'humidity',
            'light',
            'switch1',
            'switch2'
          ],        
        });
  
        await device.save();
        console.log('Mock device created:', device.deviceName);
      }else {
        console.log('❌ Device already exist on user:',userActual.devices);
      }
    } else {
      console.log('❌ Not User found on DB');
    }

    //add some mock data 
    userActual = await User.findOne({email}).populate('devices').exec();
    const device = await Device.findOne({ deviceName: 'iot1'});
   
    mockdata.forEach(async payload => {
      const newData = new DeviceData ({
        userId: userActual!._id,
        deviceId: device!._id,
        sensorsData: payload.sensorsData,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt
      });
      const dbResponse = await newData.save();
      if( dbResponse ) {
        console.log('✅ DbDeviceData updated:',dbResponse);
      };
    })
    
    console.log('✅ Seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
