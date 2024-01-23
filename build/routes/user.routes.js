"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
const userController = new user_controller_1.default();
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', auth_middleware_1.default, userController.getUserDetails);
router.get('/logout', userController.logout);
router.get('/getAllUsers', auth_middleware_1.default, userController.getAllUsers);
exports.default = router;
//# sourceMappingURL=user.routes.js.map