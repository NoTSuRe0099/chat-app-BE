import { Request, Response } from 'express';
import GroupChatModel from '../models/groupChat.model';

class ChatController {
  private groupChatModel: typeof GroupChatModel;

  constructor() {
    this.groupChatModel = GroupChatModel;
  }

  createGroup = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name } = req?.body;
      const { userId } = req;

      const group = await this.groupChatModel.create({
        name: name,
        userList: [userId],
      });

      return res.status(201).json({
        data: group,
        success: true,
        message: 'Created New Group Successfully.',
      });
    } catch (error) {
      console.error('error', error);
      return res.status(500).json({
        data: null,
        success: false,
        message: 'Something went wrong',
        error,
      });
    }
  };

  getMyChatgroups = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req;

      const groups = await this.groupChatModel.find({
        userList: { $in: [userId] },
      });

      return res.status(201).json({
        data: groups,
        success: true,
      });
    } catch (error) {
      console.error('error', error);
      return res.status(500).json({
        data: null,
        success: false,
        message: 'Something went wrong',
        error,
      });
    }
  };
}

export default ChatController;
