"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const web_push_1 = __importStar(require("web-push"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socket_server_1 = __importDefault(require("./config/socket.server"));
const mongoDB_service_1 = __importDefault(require("./config/mongoDB.service"));
require("./config/redis.service");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const port = parseInt(process.env.PORT || '5000', 10);
app.use(express_1.default.json());
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:4000', 'http://192.168.203.107:4000'],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
(0, mongoDB_service_1.default)();
// Sample route for testing
app.get('/', (req, res) => {
    return res.json({
        success: true,
        message: 'hello world',
    });
});
// Routes
app.use('/auth', user_routes_1.default);
// VAPID keys for Web Push notifications
const vapidKeys = {
    publicKey: 'BPDeVcdfBBCjjKYMwhbF_5zDQgebQzujW2KOJgdhPu2aswKRCxMMv9EOlmyJwi_0TDkvAZz1Yx8IIjzTi6T0Tr8',
    privateKey: 'TB42NXfTjO14cShxaIHRhhNMi06opcJ7W3-WJBN75C4',
};
web_push_1.default.setVapidDetails('mailto:rushipatil@mailinator.com', vapidKeys === null || vapidKeys === void 0 ? void 0 : vapidKeys.publicKey, vapidKeys === null || vapidKeys === void 0 ? void 0 : vapidKeys.privateKey);
// Store user subscriptions
let subscriptions = [];
// Store user subscription details
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    const existingSubscriptionIndex = subscriptions.findIndex((sub) => (sub === null || sub === void 0 ? void 0 : sub.endpoint) === (subscription === null || subscription === void 0 ? void 0 : subscription.endpoint));
    if (existingSubscriptionIndex !== -1) {
        console.log('Subscription already exists');
    }
    else {
        subscriptions.push(subscription);
        console.log('New subscription added');
    }
    return res.status(201).json({});
});
// Send notifications to subscribed users
app.post('/send-notification', (req, res) => {
    var _a;
    const notificationPayload = JSON.stringify({
        title: 'New Notification',
        body: ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.msg) || 'Hello there!',
    });
    Promise.all(subscriptions.map((subscription) => {
        return (0, web_push_1.sendNotification)(subscription, notificationPayload);
    }))
        .then(() => res.status(200).json({}))
        .catch((err) => res.status(500).json({ error: err === null || err === void 0 ? void 0 : err.message }));
});
// Initialize SocketService with the HTTP server
const socketService = socket_server_1.default.initialize(server);
// Start server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map