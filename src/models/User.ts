import { Schema, model, Document } from 'mongoose';
import { IDevice } from './Device';

export interface IUser extends Document {
  userName: string;
  email: string;
  passwordHash: string;
  homes: Schema.Types.ObjectId[];
  devices: Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    homes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Home',
      },
    ],
    devices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Device',
      },
    ],
  },
  { timestamps: true },
);

const User = model<IUser>('User', userSchema);
export default User;



// Usage examples:
/*
// Example 1: Without populate - devices are ObjectIds
async function getUserById(userId: string) {
  const user = await User.findById(userId);
  // user.devices is Types.ObjectId[]
  console.log(user?.devices); // Array of ObjectIds
}

// Example 2: With populate - devices are full IDevice objects
async function getUserWithDevices(userId: string) {
  const user = await User.findById(userId).populate('devices').exec();
  // user.devices is IDevice[]
  if (user) {
    user.devices.forEach(device => {
      const deviceType = device as unknown as IDevice;
      console.log(deviceType.deviceName); // Can access device properties
    });
  }
}

// Example 3: Check if user owns a device
async function userOwnsDevice(deviceId: Types.ObjectId) {
  // MongoDB automatically checks if the ObjectId exists in the array
  const user = await User.findOne({ 
    devices: deviceId 
  });
  return !!user;
}

// Example 4: Add device to user
async function addDeviceToUser(userId: string, deviceId: Types.ObjectId) {
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { devices: deviceId } }, // $addToSet prevents duplicates
    { new: true }
  );
}

// Example 5: Remove device from user
async function removeDeviceFromUser(userId: string, deviceId: Types.ObjectId) {
  await User.findByIdAndUpdate(
    userId,
    { $pull: { devices: deviceId } },
    { new: true }
  );
}*/