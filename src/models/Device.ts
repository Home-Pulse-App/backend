import { Schema, model, Document } from 'mongoose';

export const SENSOR_TYPES = [
  'temperature',
  'humidity',
  'pressure',
  'airQuality',
  'co2',
  'pm25',
  'light',
  'motion',
  'door',
  'window',
  'soilMoisture',
  'waterLevel',
  'rain',
  'windSpeed',
  'switch1',
  'switch2',
  'switch3',
  'dimmer',
  'rgbLight',
  'powerMeter',
  'heartbeat',
  'gps',
] as const;

export type SensorType = (typeof SENSOR_TYPES)[number];

//!we can add more in the furute
export const DEVICE_TYPES = ['esp32-generic', 'raspberry-pi'] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number];

export interface IDevice extends Document {
  userId: string;
  deviceName: string;
  type: DeviceType;
  state: 'ONLINE' | 'OFFLINE' | 'SLEEPING';
  sensors: Array<string>;
}

const deviceSchema = new Schema<IDevice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    deviceName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    type: {
      type: String,
      enum: DEVICE_TYPES,
      required: true,
    },

    state: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'SLEEPING'],
      default: 'OFFLINE',
    },

    sensors: [
      {
        type: String,
        enum: SENSOR_TYPES,
        required: true,
      },
    ],
  },
  { timestamps: true },
);

const Device = model<IDevice>('Device', deviceSchema);
export default Device;
