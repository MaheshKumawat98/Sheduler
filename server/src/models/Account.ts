import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAccount extends Document {
  user: Types.ObjectId;
  platform: string;
  handle: string;
  zernoAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  status: 'connected' | 'disconnected';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    handle: {
      type: String,
      required: true,
      trim: true,
    },
    zernoAccountId: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    tokenExpiresAt: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected'],
      default: 'connected',
    },
    avatarUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model<IAccount>('Account', accountSchema);

export default Account;
