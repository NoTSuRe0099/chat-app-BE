import { RedisClientType } from '@redis/client';
import jwt from 'jsonwebtoken';
import * as socketIO from 'socket.io';
import { Server } from 'socket.io';
import { ChatTypeEnum, EventTypes, MessageType } from '../Enums';
import ChatModel from '../models/Chat/chat.model';
import { redisClient } from './redis.service';

interface ExtendedSocket extends socketIO.Socket {
  userId?: string;
}

class SocketService {
  private static instance: SocketService;
  private io: Server;
  private static redisClient: RedisClientType;
  private chatModel: typeof ChatModel;

  private constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    SocketService.redisClient = redisClient; // Use static redisClient
    this.initializeSocketEvents();
    this.chatModel = ChatModel;
  }

  public static initialize(server: any): void {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService(server);
    }
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      throw new Error(
        'SocketService is not initialized. Call initialize(server) first.'
      );
    }
    return SocketService.instance;
  }

  public static async getUserSocketId(userId: string): Promise<string | null> {
    const data: string | null =
      (await SocketService?.redisClient?.hGet('userSocketMap', userId)) || '';
    return data;
  }

  private async initializeSocketEvents(): Promise<void> {
    this.io.use(async (socket: any, next: Function) => {
      const token = socket?.handshake?.auth?.['access_token'] || '';

      if (!token) {
        return next(new Error('Unauthorized: No token provided'));
      }

      jwt.verify(
        token,
        process.env.JWT_SECRET || '',
        async (err: any, decoded: any) => {
          if (err) {
            return next(new Error('Unauthorized: Invalid token'));
          }

          await this.setUserOnline(decoded?.id, socket?.id);
          socket.userId = decoded?.id;
          next();
        }
      );
    });

    this.io.on('connection', async (socket: ExtendedSocket) => {
      try {
        const { userId } = socket;
        this.emitOnlineUsers();

        socket.on(EventTypes.SEND_MESSAGE, async (data: any) => {
          const { receiverId, message, sentAt, messageType, mediaUrl } = data;
          const receiverSocketId = await SocketService.getUserSocketId(
            receiverId
          );

          await this.chatModel.create({
            senderId: userId,
            receiverId: receiverId,
            message,
            type: ChatTypeEnum.USER,
            messageType: messageType,
            mediaUrl: mediaUrl,
          });

          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit(EventTypes.RECEIVE_MESSAGE, {
              senderId: userId,
              receiverId: receiverId,
              message,
              sentAt,
              messageType,
              mediaUrl,
            });
          }
        });

        socket.on(EventTypes.JOIN_GROUP, async (data) =>
          this.joinGroup(socket, data)
        );

        socket.on(EventTypes.SEND_GROUP_MESSAGE, this.sendGroupMessage);

        socket.on(EventTypes.USER_TYPING, this.isUserTypingTrigger);

        socket.on('disconnect', async () => {
          userId && (await this.setUserOffline(userId));
          console.log('User disconnected');
          this.emitOnlineUsers();
        });
      } catch (error) {
        console.log('socket Errors', error);
      }
    });
  }

  public getIO = (): Server => {
    if (!this.io) {
      throw new Error('Socket.IO not initialized!');
    }
    return this.io;
  };

  private getOnlineUsers = async (): Promise<string[]> => {
    const onlineUsers: string[] = await SocketService.redisClient.sMembers(
      'onlineUsers'
    );
    return onlineUsers;
  };

  private setUserOnline = async (
    userId: string,
    socketId: string
  ): Promise<void> => {
    await SocketService.redisClient.sAdd('onlineUsers', userId);
    await SocketService.redisClient.hSet('userSocketMap', userId, socketId);
  };

  private setUserOffline = async (userId: string): Promise<void> => {
    await SocketService.redisClient.sRem('onlineUsers', userId);
    await SocketService.redisClient.hDel('userSocketMap', userId);
  };

  private emitOnlineUsers = async (): Promise<void> => {
    const onlineUsers = await this.getOnlineUsers();
    console.log('onlineUsers', onlineUsers);
    this.io.emit(EventTypes.UPDATED_ONLINE_USERS, onlineUsers);
  };

  private joinGroup = async (
    socket: ExtendedSocket,
    data: any
  ): Promise<void> => {
    const { groupId } = data;
    await socket.join(groupId);
  };

  private sendGroupMessage = async (data: {
    groupId: string;
    payload: {
      senderId: string;
      senderName: string;
      message: string;
      sentAt: Date | string;
      messageType: string;
      mediaUrl: string;
    };
  }): Promise<void> => {
    const { groupId, payload } = data;
    const { messageType, mediaUrl } = payload;
    await this.chatModel.create({
      senderId: payload?.senderId,
      message: payload?.message,
      groupId: groupId,
      type: ChatTypeEnum.GROUP,
      messageType: messageType,
      mediaUrl: mediaUrl,
    });
    this.io.to(groupId).emit(EventTypes.RECEIVE_GROUP_MESSAGE, {
      groupId: groupId,
      ...payload,
    });
  };

  private isUserTypingTrigger = async (data: {
    senderId: string;
    receiverId: string;
    isTyping: boolean;
    groupId: string;
    groupUserList: string[];
  }): Promise<void> => {
    const { receiverId, groupId, groupUserList, senderId } = data;
    if (groupId) {
      for (const userId of groupUserList) {
        if (userId !== senderId) {
          const userSocketId = await SocketService?.getUserSocketId(userId);
          if (userSocketId) {
            this.io
              .to(userSocketId as string)
              .emit(EventTypes.IS_USER_TYPING, { ...data });
          }
        }
      }
    }
    if (receiverId) {
      const receiverSocketId = await SocketService?.getUserSocketId(receiverId);
      if (receiverSocketId) {
        this.io
          .to(receiverSocketId as string)
          .emit(EventTypes.IS_USER_TYPING, { ...data });
      }
    }
  };
}

export default SocketService;
