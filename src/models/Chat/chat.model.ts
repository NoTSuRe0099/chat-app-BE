import { Schema, Document, model, Types } from 'mongoose';
import { ChatTypeEnum, MessageType } from '../../Enums';

export interface IChat {
  type: ChatTypeEnum.USER | ChatTypeEnum.GROUP;
  senderId: Types.ObjectId;
  message: string;
  sentAt?: Date | string;
  messageType: MessageType.TEXT | MessageType.MEDIA;
  mediaUrl: string;
}

export interface IUserChat extends IChat {
  type: ChatTypeEnum.USER;
  receiverId: Types.ObjectId;
  groupId?: null;
}

export interface IGroupChat extends IChat {
  type: ChatTypeEnum.GROUP;
  groupId: Types.ObjectId;
  receiverId?: null;
}

export interface IChatDocument extends IChat, Document {
  receiverId?: Types.ObjectId | null;
  groupId?: Types.ObjectId | null;
}

const ChatSchema = new Schema(
  {
    type: {
      type: String,
      enum: [ChatTypeEnum.USER, ChatTypeEnum.GROUP],
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    groupId: { type: Schema.Types.ObjectId, ref: 'groupChat', required: false },
    messageType: {
      type: String,
      enum: [MessageType.TEXT, MessageType.MEDIA],
      required: true,
    },
    message: { type: String, required: false },
    sentAt: { type: Date, default: Date.now },
    mediaUrl: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const ChatModel = model<IChatDocument>('Chat', ChatSchema);

export default ChatModel;
