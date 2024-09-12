import { Request, Response } from 'express';
import GroupChatModel from '../models/chatGroup.model';
import GroupChatInvtSchemaModel from '../models/groupChatInvt.model';
import UserModel from '../models/user.model';
import mongoose from 'mongoose';
import SocketService from '../config/socket.server';

class ChatController {
  private groupChatModel: typeof GroupChatModel;
  private groupChatInvtSchemaModel: typeof GroupChatInvtSchemaModel;
  private userModel: typeof UserModel;

  constructor() {
    this.groupChatModel = GroupChatModel;
    this.groupChatInvtSchemaModel = GroupChatInvtSchemaModel;
    this.userModel = UserModel;
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

  setMyChatgroups = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req;

      const groups = await this.groupChatModel.aggregate([
        {
          $match: {
            userList: { $in: [new mongoose.Types.ObjectId(userId)] },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userList',
            foreignField: '_id',
            as: 'userDetails',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            groupName: 1,
            createdAt: 1,
            updatedAt: 1,
            name: 1,
            userList: {
              $map: {
                input: '$userList',
                as: 'userId',
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        '$userDetails',
                        { $indexOfArray: ['$userDetails._id', '$$userId'] },
                      ],
                    },
                    { _id: '$$userId' },
                  ],
                },
              },
            },
          },
        },
      ]);

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

  invtToGroupChat = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId, body } = req;
      const { receiverId, groupId } = body;

      const isExist = await this.groupChatInvtSchemaModel.findOne({
        $and: [
          { senderId: { $eq: new mongoose.Types.ObjectId(userId) } },
          { receiverId: { $eq: receiverId } },
          { groupId: new mongoose.Types.ObjectId(groupId) },
        ],
      });
      const io = SocketService.getInstance().getIO();

      const receiverSocketId: string =
        (await SocketService.getUserSocketId(receiverId)) || '';

      io.to(receiverSocketId).emit('NEW_GROUP_INVITATION', {
        groupId: groupId,
        senderId: userId,
      });
      if (isExist) {
        return res.status(201).json({
          data: null,
          success: false,
          message: 'Invite already sent to the user!',
        });
      }

      const invt = await this.groupChatInvtSchemaModel.create({
        senderId: userId,
        receiverId,
        groupId,
        isAccepted: false,
      });

      return res.status(201).json({
        data: invt,
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

  getGroupChatRequest = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { userId } = req;

      const invts = await this.groupChatInvtSchemaModel.aggregate([
        {
          $match: {
            receiverId: new mongoose.Types.ObjectId(userId),
            isAccepted: false,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'senderId',
            foreignField: '_id',
            as: 'sender_details_arr',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'groupchats',
            localField: 'groupId',
            foreignField: '_id',
            as: 'group_details_arr',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            sender_details: { $arrayElemAt: ['$sender_details_arr', 0] },
            group_details: { $arrayElemAt: ['$group_details_arr', 0] },
          },
        },
        {
          $unset: [
            'updatedAt',
            '__v',
            'sender_details_arr',
            'group_details_arr',
          ],
        },
      ]);

      return res.status(201).json({
        data: invts,
        success: false,
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

  invtRequestAction = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const {
        userId,
        body: { id, isAccepted },
      } = req;

      const isExist = await this.groupChatInvtSchemaModel.findById(id);

      if (!isExist) {
        return res.status(404).json({
          data: null,
          success: false,
          message: "Request doesn't exist!",
        });
      }

      if (isAccepted) {
        const isUserExistsInSameGroup = await this.groupChatModel.findOne({
          _id: isExist.groupId,
          userList: new mongoose.Types.ObjectId(userId),
        });

        if (!isUserExistsInSameGroup) {
          isExist.isAccepted = true;
          await isExist.save();

          await this.groupChatModel.updateOne(
            { _id: isExist.groupId },
            {
              $push: { userList: new mongoose.Types.ObjectId(userId) },
            }
          );

          return res.status(200).json({
            data: isExist,
            success: true,
            message: 'Request accepted',
          });
        }

        return res.status(400).json({
          data: null,
          success: false,
          message: 'User already exists in the group',
        });
      } else {
        await isExist.deleteOne();
        return res.status(200).json({
          data: null,
          success: true,
          message: 'Request deleted',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        data: null,
        success: false,
        message: 'Something went wrong',
        error,
      });
    }
  };

  getGroupChatUserForInvite = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { userId } = req;
      const { groupId } = req?.params;

      const userList = await this.userModel.aggregate([
        {
          $match: {
            _id: { $ne: new mongoose.Types.ObjectId(userId) },
          },
        },
        {
          $lookup: {
            from: 'groupchatinvts',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$receiverId', '$$userId'] },
                      {
                        $eq: ['$groupId', new mongoose.Types.ObjectId(groupId)],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'requests',
          },
        },
        {
          $addFields: {
            requestExists: { $gt: [{ $size: '$requests' }, 0] },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            requestExists: 1,
          },
        },
      ]);
      return res.status(201).json({
        data: userList,
        success: false,
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
