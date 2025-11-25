import { Schema, model, Document } from 'mongoose';

export interface IDevice extends Document {
  deviceId: string;
  deviceName: string;
  type: 'light' | 'sensor' | 'thermostat' | 'other';
  state: 'ON' | 'OFF';
  roomId: Schema.Types.ObjectId | null;
}

const deviceSchema = new Schema<IDevice>(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
    },

    deviceName: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['light', 'sensor', 'thermostat', 'other'],
      required: true,
    },

    state: {
      type: String,
      enum: ['ON', 'OFF'],
      default: 'OFF',
    },

    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
  },
  { timestamps: true },
);

const Device = model<IDevice>('Device', deviceSchema);
export default Device;
