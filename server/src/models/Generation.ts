import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGeneration extends Document {
  user: Types.ObjectId;
  prompt: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  tone: string;
  createdAt: Date;
  updatedAt: Date;
}

const generationSchema = new Schema<IGeneration>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      required: false,
    },
    mediaType: {
      type: String,
      required: false,
    },
    tone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Generation = mongoose.model<IGeneration>('Generation', generationSchema);

export default Generation;
