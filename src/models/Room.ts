import { Schema, model, Document, Types } from 'mongoose';

export interface IRoom extends Document {
  roomName: string;
  homeId: Types.ObjectId;
  devices: Types.ObjectId[];
  viewDevices: Types.ObjectId[];
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
        type: Schema.Types.ObjectId,
        ref: 'ViewDevices',
        default: [],
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
