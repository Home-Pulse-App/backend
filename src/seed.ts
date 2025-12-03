import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Home from './models/Home';
import Room from './models/Room';
import Device from './models/Device';
import DeviceData from './models/DeviceData';
import mockdata from '../mockData/home-pulse.devicedatas.json';

async function seed() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected.');

    // --- 1. USER ---
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
      console.log('✅ Mock user created:', user.email);
    } else {
      console.log('ℹ️ User already exists:', email);
    }

    // --- 2. HOME ---
    let home = await Home.findOne({ userId: user._id });

    if (!home) {
      home = await Home.create({
        homeName: 'Test Home',
        userId: user._id,
        rooms: [],
      });

      // ВАЖНО: Обновляем массив homes у пользователя
      user.homes.push(home._id);
      await user.save();

      console.log('✅ Mock home created:', home.homeName);
    } else {
      console.log('ℹ️ Home already exists:', home.homeName);
    }

    // --- 3. ROOM ---
    let room = await Room.findOne({ homeId: home._id }); // Ищем комнату в ЭТОМ доме

    if (!room) {
      room = await Room.create({
        roomName: 'Test room',
        homeId: home._id, // ИСПРАВЛЕНО: Привязываем к ID дома, а не юзера
        devices: [],
      });

      // ВАЖНО: Обновляем массив rooms у дома
      home.rooms.push(room._id);
      await home.save();

      console.log('✅ Mock room created:', room.roomName);
    } else {
      console.log('ℹ️ Room already exists:', room.roomName);
    }

    // --- 4. DEVICE ---
    // Проверяем наличие устройства по имени, чтобы избежать дубликатов
    const deviceName = 'iot1';
    let device = await Device.findOne({ deviceName });

    if (!device) {
      device = new Device({
        deviceName: deviceName,
        userId: user._id, // ИСПРАВЛЕНО: Добавлено обязательное поле userId
        type: 'esp32-generic',
        state: 'OFFLINE',
        connectedToRoom: room._id, // Опционально: сразу привязываем к комнате
        sensors: ['temperature', 'humidity', 'light', 'switch1', 'switch2'],
      });

      await device.save();

      // ВАЖНО: Обновляем связи у User и Room
      user.devices.push(device._id);
      await user.save();

      room.devices.push(device._id);
      await room.save();

      console.log('✅ Mock device created:', device.deviceName);
    } else {
      console.log('ℹ️ Device already exists:', device.deviceName);
    }

    // --- 5. MOCK DATA ---
    console.log('Starting data seeding...');

    // ИСПРАВЛЕНО: Используем for...of вместо forEach для последовательного async/await
    for (const payload of mockdata) {
      // Проверка, чтобы не дублировать данные (опционально, но полезно)
      // Предполагаем, что createdAt уникален для устройства
      const exists = await DeviceData.exists({
        deviceId: device._id,
        createdAt: payload.createdAt,
      });

      if (!exists) {
        const newData = new DeviceData({
          userId: user._id,
          deviceId: device._id,
          sensorsData: payload.sensorsData,
          createdAt: payload.createdAt,
          updatedAt: payload.updatedAt,
        });

        await newData.save();
        // console.log('✅ Data point saved'); // Можно раскомментировать, если данных мало
      }
    }

    console.log('✅ Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
