"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_io_1 = require("socket.io");
const redis_service_1 = require("./redis.service");
class SocketService {
    constructor(server) {
        this.getIO = () => {
            if (!this.io) {
                throw new Error('Socket.IO not initialized!');
            }
            return this.io;
        };
        this.getUserSocketId = async (userId) => {
            const data = (await this.redisClient.hGet('userSocketMap', userId)) || '';
            return data;
        };
        this.getOnlineUsers = async () => {
            const onlineUsers = await this.redisClient.sMembers('onlineUsers');
            return onlineUsers;
        };
        this.setUserOnline = async (userId, socketId) => {
            await this.redisClient.sAdd('onlineUsers', userId);
            await this.redisClient.hSet('userSocketMap', userId, socketId);
        };
        this.setUserOffline = async (userId) => {
            await this.redisClient.sRem('onlineUsers', userId);
            await this.redisClient.hDel('userSocketMap', userId);
        };
        this.emitOnlineUsers = async () => {
            const onlineUsers = await this.getOnlineUsers();
            console.log('onlineUsers', onlineUsers);
            this.io.emit('UPDATED_ONLINE_USERS', onlineUsers);
        };
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        this.initializeSocketEvents();
        this.redisClient = redis_service_1.redisClient;
    }
    async initializeSocketEvents() {
        this.io.use(async (socket, next) => {
            var _a, _b;
            const cookie = (_b = (_a = socket === null || socket === void 0 ? void 0 : socket.handshake) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.cookie;
            const token = cookie ? cookie === null || cookie === void 0 ? void 0 : cookie.replace('access_token=', '') : null;
            if (!token) {
                return next(new Error('Unauthorized: No token provided'));
            }
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '', async (err, decoded) => {
                if (err) {
                    return next(new Error('Unauthorized: Invalid token'));
                }
                await this.setUserOnline(decoded === null || decoded === void 0 ? void 0 : decoded.id, socket === null || socket === void 0 ? void 0 : socket.id);
                // If authenticated, add user data to socket
                socket.userId = decoded === null || decoded === void 0 ? void 0 : decoded.id;
                next();
            });
        });
        this.io.on('connection', async (socket) => {
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
    static initialize(server) {
        return new SocketService(server);
    }
}
exports.default = SocketService;
//# sourceMappingURL=socket.server.js.map