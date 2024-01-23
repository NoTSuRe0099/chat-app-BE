import { Router } from 'express';
import UserController from '../controllers/user.controller';
import isAuthenticated from '../middlewares/auth.middleware';

const router: Router = Router();
const userController: UserController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', isAuthenticated, userController.getUserDetails);
router.get('/logout', userController.logout);
router.get('/getAllUsers', isAuthenticated, userController.getAllUsers);

export default router;
