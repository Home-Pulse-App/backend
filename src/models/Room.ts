import { Schema, model, Document, Types } from 'mongoose';

export interface IRoom extends Document {
  roomName: string;
  homeId: Types.ObjectId;
  devices: Types.ObjectId[];
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
  },
  { timestamps: true },
);

const Room = model<IRoom>('Room', roomSchema);
export default Room;
