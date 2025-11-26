import { Schema, model, Document } from 'mongoose';

export const DATA_TYPES = [
{  
  // Environmental numeric sensors
  temperature: Number,     // °C
  humidity: Number,        // % RH
  pressure: Number,        // hPa
  airQuality: Number,      // index or ppm
  co2: Number,             // ppm
  pm25: Number,            // µg/m³
  light: Number,           // 0–100%
  soilMoisture: Number,    // 0–100%
  waterLevel: Number,      // cm or %
  rain: Number,            // mm/h or boolean
  windSpeed: Number,       // m/s
  // Binary sensors (0 = off/false, 1 = on/true)
  motion: Boolean,         // true when motion detected
  door: Boolean,
  window: Boolean,
  // Actuators / outputs
  switch1: Boolean,
  switch2: Boolean,
  switch3: Boolean,
  dimmer: Number,          // 0–100
  rgbLight: String,        // "255,100,50"
  // Power & energy
  powerMeter: Number,      // Watts or kWh
  // Health
  heartbeat: Number,       // BPM
  // Location
  gps: Object,             // { lat: Number, lng: Number, alt?: Number }
}
] as const;

export type DataType = (typeof DATA_TYPES)[number];

export interface IDeviceData extends Document {
  userId: Schema.Types.ObjectId;
  deviceId: Number;
  sensorsData: DataType;
}

const deviceDataSchema = new Schema<IDeviceData>(
  {
    deviceId: {
      type: Number,
      required: true,
      trim: true,
    },

    sensorsData: {
      type: String,
      enum: DATA_TYPES,
      required: true,
    },
  },
  { timestamps: true },
);

const DeviceData = model<IDeviceData>('DeviceData', deviceDataSchema);
export default DeviceData;
