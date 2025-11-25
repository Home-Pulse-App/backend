import { Schema, model, Document } from 'mongoose';

export interface IDeviceData extends Document {
  userId: Schema.Types.ObjectId;
  deviceId: string;
  sensorsData: any;
}

const deviceDataSchema = new Schema<IDeviceData>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    deviceId: {
      type: String,
      required: true,
      trim: true,
    },

    sensorsData: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true },
);

const DeviceData = model<IDeviceData>('DeviceData', deviceDataSchema);
export default DeviceData;
