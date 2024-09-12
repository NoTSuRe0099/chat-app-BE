import mongoose, { Document, Schema } from 'mongoose';

interface IGroupChat extends Document {
  name: string;
  userList: string[];
}

const groupChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userList: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // createdBy: { type: String, required: false },
  },
  { timestamps: true }
);

const GroupChatModel = mongoose.model<IGroupChat>('groupChat', groupChatSchema);

export default GroupChatModel;
