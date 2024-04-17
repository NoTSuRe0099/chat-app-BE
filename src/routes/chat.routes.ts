import { Router } from 'express';
import isAuthenticated from '../middlewares/auth.middleware';
import ChatController from '../controllers/chat.cotroller';

const router: Router = Router();
const chatController: ChatController = new ChatController();

router.post('/createNewChatGroup', isAuthenticated, chatController.createGroup);
router.get('/setMyChatgroups', isAuthenticated, chatController.setMyChatgroups);

export default router;
