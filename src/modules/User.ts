import { Schema, model, Document } from 'mongoose';

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
