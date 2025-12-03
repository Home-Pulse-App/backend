import { Schema, model, Document, Types } from 'mongoose';
import { DataType } from './DeviceData';

export interface IViewDevice {
  id: string;
  model: string;
  position: number[];
  rotation: number[];
  scale: number;
  sensorData: DataType;
}

export interface IRoom extends Document {
  roomName: string;
  homeId: Types.ObjectId;
  devices: Types.ObjectId[];
  viewDevices: IViewDevice[];
  viewSplatFileId: Types.ObjectId | null; // GridFS file reference
}

const roomSchema = new Schema<IRoom>(
  {
    roomName: {
      type: String,
      required: true,
      trim: true,
    },

    homeId: {
      type: Schema.Types.ObjectId,
      ref: 'Home',
      required: true,
    },

    devices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Device',
        default: [],
      },
    ],
    viewDevices: [
      {
        id: { type: String, required: true },
        model: { type: String, required: true },
        position: { type: [Number], required: true },
        rotation: { type: [Number], required: true },
        scale: { type: Number, required: true },
        sensorData: {
          temperature: { type: Number },
          humidity: { type: Number },
          light: { type: Number },
          switch1: { type: Number },
          switch2: { type: Number },
          button1: { type: Number },
          button2: { type: Number },
        },
      },
    ],
    viewSplatFileId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true },
);

const Room = model<IRoom>('Room', roomSchema);
export default Room;
