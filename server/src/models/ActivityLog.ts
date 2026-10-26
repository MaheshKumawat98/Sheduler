import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivityLog extends Document {
  user: Types.ObjectId;
  actionType: 'post_published' | 'ai_reply';
  description: string;
  relatedPost?: Types.ObjectId;
  platform?: string;
  generatedText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['post_published', 'ai_reply'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedPost: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: false,
    },
    platform: {
      type: String,
      required: false,
    },
    generatedText: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

export default ActivityLog;
