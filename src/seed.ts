import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import fs from 'fs';
import path from 'path';
import User from './models/User';
import Home from './models/Home';
import Room from './models/Room';
import Device from './models/Device';
import DeviceData from './models/DeviceData';

const MOCK_DATA_DIR = path.join(__dirname, '../mockData');

// Helper to transform EJSON (Extended JSON) from mongoexport
function transform(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transform);
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle specific EJSON keys
  if (obj.$oid) return new Types.ObjectId(obj.$oid);
  if (obj.$date) return new Date(obj.$date);
  if (obj.$binary) {
    // EJSON binary format: { "$binary": { "base64": "...", "subType": "..." } }
    if (obj.$binary.base64) {
      return Buffer.from(obj.$binary.base64, 'base64');
    }
    // Fallback if structure is different (less likely with mongoexport)
    return obj.$binary;
  }

  const newObj: any = {};
  for (const key in obj) {
    if (key === '__v') continue; // We can skip __v or keep it. Mongoose will manage it.
    newObj[key] = transform(obj[key]);
  }
  return newObj;
}

async function seedCollection(fileName: string, model: mongoose.Model<any>) {
  const filePath = path.join(MOCK_DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File ${fileName} not found, skipping.`);
    return;
  }

  console.log(`Reading ${fileName}...`);
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);
    const transformedData = transform(data);

    console.log(`Seeding ${model.modelName}...`);
    await model.deleteMany({});
    if (transformedData.length > 0) {
      // Use insertMany with lean option if possible, but for models standard insertMany is fine
      await model.insertMany(transformedData);
    }
    console.log(`✅ ${model.modelName} seeded with ${transformedData.length} records.`);
  } catch (err) {
    console.error(`Error seeding ${fileName}:`, err);
  }
}

async function seedNativeCollection(fileName: string, collectionName: string) {
  const filePath = path.join(MOCK_DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File ${fileName} not found, skipping.`);
    return;
  }

  console.log(`Reading ${fileName}...`);
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);
    const transformedData = transform(data);

    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    const collection = mongoose.connection.db.collection(collectionName);
    console.log(`Seeding native collection ${collectionName}...`);
    await collection.deleteMany({});
    if (transformedData.length > 0) {
      await collection.insertMany(transformedData);
    }
    console.log(`✅ Collection ${collectionName} seeded with ${transformedData.length} records.`);
  } catch (err) {
    console.error(`Error seeding ${collectionName}:`, err);
  }
}

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Seed Mongoose Models
    await seedCollection('home-pulse.users.json', User);
    await seedCollection('home-pulse.homes.json', Home);
    await seedCollection('home-pulse.rooms.json', Room);
    await seedCollection('home-pulse.devices.json', Device);
    await seedCollection('home-pulse.devicedatas.json', DeviceData);

    // Seed Native Collections (GridFS)
    await seedNativeCollection('home-pulse.splatFiles.files.json', 'splatFiles.files');
    await seedNativeCollection('home-pulse.splatFiles.chunks.json', 'splatFiles.chunks');

    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
