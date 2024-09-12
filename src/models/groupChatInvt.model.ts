import mongoose, { Document, Schema } from 'mongoose';

interface IGroupChatInvt extends Document {
  senderId: string;
  receiverId: string;
  groupId: string;
  isAccepted: boolean;
}

const groupChatInvtSchema = new mongoose.Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'groupChat', required: true },
    isAccepted: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const GroupChatInvtSchemaModel = mongoose.model<IGroupChatInvt>(
  'GroupChatInvt',
  groupChatInvtSchema
);

export default GroupChatInvtSchemaModel;
