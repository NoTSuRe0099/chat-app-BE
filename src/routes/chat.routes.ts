import { Router } from 'express';
import isAuthenticated from '../middlewares/auth.middleware';
import ChatController from '../controllers/chat.cotroller';

const router: Router = Router();
const chatController: ChatController = new ChatController();

router.post('/createNewChatGroup', isAuthenticated, chatController.createGroup);
router.get('/setMyChatgroups', isAuthenticated, chatController.setMyChatgroups);

//* Group Chat Invite routes
router.post('/invtToGroup', isAuthenticated, chatController.invtToGroupChat);
router.get(
  '/getGroupChatRequest',
  isAuthenticated,
  chatController.getGroupChatRequest
);
router.post(
  '/invtRequestAction',
  isAuthenticated,
  chatController.invtRequestAction
);
router.get(
  '/getGroupChatUserForInvite/:groupId',
  isAuthenticated,
  chatController.getGroupChatUserForInvite
);

router.get('/loadChats', isAuthenticated, chatController.fetchChats);

export default router;
