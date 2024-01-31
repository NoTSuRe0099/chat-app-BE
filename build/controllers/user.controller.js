"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constanst_1 = require("../utils/constanst");
const user_model_1 = __importDefault(require("../models/user.model"));
class UserController {
    constructor() {
        this.userModel = user_model_1.default;
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.getUserDetails = this.getUserDetails.bind(this);
        this.logout = this.logout.bind(this);
        this.getAllUsers = this.getAllUsers.bind(this);
    }
    async register(req, res) {
        try {
            const { name, email, password } = req === null || req === void 0 ? void 0 : req.body;
            if (!name || !email || !password) {
                return res.status(500).json({
                    data: null,
                    success: false,
                    message: 'Please enter name, email & password',
                });
            }
            const exists = await this.userModel.findOne({ email });
            if (exists) {
                return res.status(500).json({
                    data: null,
                    success: false,
                    message: 'Email already exists',
                });
            }
            const newUser = new this.userModel({
                name,
                email,
                password: bcrypt_1.default.hashSync(password, 10),
            });
            await newUser.save();
            const accessToken = jsonwebtoken_1.default.sign({ id: newUser._id }, process.env.JWT_SECRET || '', {
                expiresIn: '1d',
            });
            return res
                .status(201)
                .cookie('access_token', accessToken, constanst_1.cookieOptions)
                .json({
                data: null,
                success: true,
                message: 'Registration Successful.',
            });
        }
        catch (error) {
            console.error('error', error);
            return res.status(500).json({
                data: null,
                success: false,
                message: 'Something went wrong',
                error,
            });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req === null || req === void 0 ? void 0 : req.body;
            if (!email || !password) {
                return res.status(500).json({
                    data: null,
                    success: false,
                    message: 'Please enter email & password',
                });
            }
            const user = await this.userModel.findOne({ email }).select('password');
            if (!user) {
                return res.status(500).json({
                    data: null,
                    success: false,
                    message: 'Email or password is wrong',
                });
            }
            const isMatch = await bcrypt_1.default.compare(password, (user === null || user === void 0 ? void 0 : user.password) || '');
            if (!isMatch) {
                return res.status(500).json({
                    data: null,
                    success: true,
                    message: 'Email or password is wrong',
                });
            }
            const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || '', {
                expiresIn: '1d',
            });
            return res
                .status(200)
                .cookie('access_token', accessToken, constanst_1.cookieOptions)
                .json({
                data: null,
                success: true,
                message: 'Logged in Successfully',
            });
        }
        catch (error) {
            console.error('error', error);
            return res.status(500).json({
                data: null,
                success: false,
                message: 'Something went wrong',
                error,
            });
        }
    }
    async getUserDetails(req, res) {
        try {
            const { userId } = req;
            const user = await this.userModel.findById(userId);
            return res.status(200).json({
                data: user,
                success: true,
                message: '',
            });
        }
        catch (error) {
            return res.status(500).json({
                data: null,
                success: false,
                message: 'Something went wrong',
                error,
            });
        }
    }
    async getAllUsers(req, res) {
        try {
            const users = await this.userModel
                .find({ _id: { $ne: req === null || req === void 0 ? void 0 : req.userId } })
                .select('-email -createdAt -updatedAt -__v');
            return res.status(200).json({
                data: users,
                success: true,
                message: '',
            });
        }
        catch (error) {
            console.error('qweq', error);
            return res.status(500).json({
                data: null,
                success: false,
                message: 'Something went wrong',
                error,
            });
        }
    }
    async logout(req, res) {
        try {
            return res.status(200).cookie('access_token', null, constanst_1.cookieOptions).json({
                data: null,
                success: true,
                message: 'Logged out Successfully',
            });
        }
        catch (error) {
            return res.status(500).json({
                data: null,
                success: false,
                message: 'Something went wrong',
                error,
            });
        }
    }
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map