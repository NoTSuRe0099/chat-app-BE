import express, { Application, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import webpush, { sendNotification } from 'web-push';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import SocketService from './config/socket.server';
import connectDB from './config/mongoDB.service';
import './config/redis.service';
import AuthRoutes from './routes/user.routes';
import ChatRoutes from './routes/chat.routes';

dotenv.config();

const app: Application = express();
const server: http.Server = http.createServer(app);
const port: number = parseInt(process.env.PORT || '5000', 10);

app.use(express.json());
// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL as string,
      'http://localhost:7274',
      'http://localhost:4000',
    ],
    credentials: true,
  })
);
app.use(cookieParser());

connectDB();

// Sample route for testing
app.get('/', (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'hello world',
  });
});

// Routes
app.use('/auth', AuthRoutes);
app.use('/chat', ChatRoutes);

// VAPID keys for Web Push notifications
const vapidKeys = {
  publicKey:
    'BPDeVcdfBBCjjKYMwhbF_5zDQgebQzujW2KOJgdhPu2aswKRCxMMv9EOlmyJwi_0TDkvAZz1Yx8IIjzTi6T0Tr8',
  privateKey: 'TB42NXfTjO14cShxaIHRhhNMi06opcJ7W3-WJBN75C4',
};

webpush.setVapidDetails(
  'mailto:rushipatil@mailinator.com',
  vapidKeys?.publicKey,
  vapidKeys?.privateKey
);

// Store user subscriptions
let subscriptions: webpush.PushSubscription[] = [];

// Store user subscription details
app.post('/subscribe', (req: Request, res: Response) => {
  const subscription: webpush.PushSubscription = req.body;
  const existingSubscriptionIndex: number = subscriptions.findIndex(
    (sub) => sub?.endpoint === subscription?.endpoint
  );

  if (existingSubscriptionIndex !== -1) {
    console.log('Subscription already exists');
  } else {
    subscriptions.push(subscription);
    console.log('New subscription added');
  }

  return res.status(201).json({});
});

// Send notifications to subscribed users
app.post('/send-notification', (req: Request, res: Response) => {
  const notificationPayload: string = JSON.stringify({
    title: 'New Notification',
    body: req?.body?.msg || 'Hello there!',
  });

  Promise.all(
    subscriptions.map((subscription) => {
      return sendNotification(subscription, notificationPayload);
    })
  )
    .then(() => res.status(200).json({}))
    .catch((err) => res.status(500).json({ error: err?.message }));
});

// Initialize SocketService with the HTTP server
const socketService = SocketService.initialize(server);

// Declaration merging to extend Request type globally
declare module 'express' {
  interface Request {
    userId?: string;
    // Add other custom properties if needed
  }
}

// Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
