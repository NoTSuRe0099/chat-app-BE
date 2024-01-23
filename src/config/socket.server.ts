import { RedisClientType } from '@redis/client';
import jwt from 'jsonwebtoken';
import * as socketIO from 'socket.io';
import { Server } from 'socket.io';
import { redisClient } from './redis.service';

interface ExtendedSocket extends socketIO.Socket {
  userId?: string;
}

class SocketService {
  private io: Server;
  private redisClient: RedisClientType;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    this.initializeSocketEvents();
    this.redisClient = redisClient;
  }

  private async initializeSocketEvents(): Promise<void> {
    this.io.use(async (socket: any, next: Function) => {
      const cookie = socket?.handshake?.headers?.cookie;
      const token = cookie ? cookie?.replace('access_token=', '') : null;

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
          // If authenticated, add user data to socket
          socket.userId = decoded?.id;
          next();
        }
      );
    });

    this.io.on('connection', async (socket: ExtendedSocket) => {
      const { userId } = socket;

      this.emitOnlineUsers();

      socket.on('SEND_MESSAGE', async (data) => {
        const { receiverId, message, sentAt } = data;
        const receiverSocketId = (await this.getUserSocketId(receiverId)) || '';

        console.log('receiverSocketId', receiverSocketId);

        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit('RECEIVE_MESSAGE', {
            senderId: userId,
            receiverId: receiverId,
            message,
            sentAt,
          });
        }
      });

      socket.on('disconnect', async () => {
        userId && (await this.setUserOffline(userId));
        console.log('User disconnected');
        this.emitOnlineUsers();
      });
    });
  }

  public getIO = (): Server => {
    if (!this.io) {
      throw new Error('Socket.IO not initialized!');
    }
    return this.io;
  };

  public static initialize(server: any): SocketService {
    return new SocketService(server);
  }

  private getUserSocketId = async (userId: string): Promise<string | null> => {
    const data: string | null =
      (await this.redisClient.hGet('userSocketMap', userId)) || '';
    return data;
  };

  private getOnlineUsers = async (): Promise<string[]> => {
    const onlineUsers: string[] = await this.redisClient.sMembers(
      'onlineUsers'
    );
    return onlineUsers;
  };

  private setUserOnline = async (
    userId: string,
    socketId: string
  ): Promise<void> => {
    await this.redisClient.sAdd('onlineUsers', userId);
    await this.redisClient.hSet('userSocketMap', userId, socketId);
  };

  private setUserOffline = async (userId: string): Promise<void> => {
    await this.redisClient.sRem('onlineUsers', userId);
    await this.redisClient.hDel('userSocketMap', userId);
  };

  private emitOnlineUsers = async (): Promise<void> => {
    const onlineUsers = await this.getOnlineUsers();
    console.log('onlineUsers', onlineUsers);
    this.io.emit('UPDATED_ONLINE_USERS', onlineUsers);
  };
}

export default SocketService;
