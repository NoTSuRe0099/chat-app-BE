import { Schema, Document, model, Types } from 'mongoose';

export enum ChatTypeEnum {
  USER = 'user',
  GROUP = 'group',
}

export interface IChat {
  type: ChatTypeEnum.USER | ChatTypeEnum.GROUP;
  senderId: Types.ObjectId;
  message: string;
  sentAt?: Date | string;
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
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const ChatModel = model<IChatDocument>('Chat', ChatSchema);

export default ChatModel;
