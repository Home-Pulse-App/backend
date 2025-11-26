import { Schema, model, Document } from 'mongoose';
import { DEVICE_TYPES, IDevice } from './Device';

export interface IUser extends Document {
  userId:number,
  userName: string;
  email: string;
  passwordHash: string;
  homes: Schema.Types.ObjectId[];
  devices: Array<IDevice>;
}

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
    },
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
        type: DEVICE_TYPES,
        ref: 'Device',
      },
    ],
  },
  { timestamps: true },
);

const User = model<IUser>('User', userSchema);
export default User;
