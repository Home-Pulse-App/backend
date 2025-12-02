import { Schema, model, Document, Types } from 'mongoose';

export interface IRoom extends Document {
  roomName: string;
  homeId: Types.ObjectId;
  devices: Types.ObjectId[];
  viewDevices: Types.ObjectId[];
  viewSplat: string;
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
        ref: 'Devices',
        default: [],
      },
    ],
    viewDevices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ViewDevices',
        default: [],
      },
    ],
    viewSplat: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

const Room = model<IRoom>('Room', roomSchema);
export default Room;
