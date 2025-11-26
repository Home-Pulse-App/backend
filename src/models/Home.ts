import { Schema, model, Document } from 'mongoose';

export interface IHome extends Document {
  homeName: string;
  userId: Schema.Types.ObjectId;
  rooms: Schema.Types.ObjectId[];
}

const homeSchema = new Schema<IHome>(
  {
    homeName: {
      type: String,
      required: true,
      trim: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    rooms: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        default: [],
      },
    ],
  },
  { timestamps: true },
);

const Home = model<IHome>('Home', homeSchema);
export default Home;
