import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookieOptions } from '../utils/constanst';
import UserModel from '../models/user.model';

class UserController {
  private userModel: typeof UserModel;

  constructor() {
    this.userModel = UserModel;
  }

  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, email, password } = req?.body;

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
        password: bcrypt.hashSync(password, 10),
      });

      await newUser.save();

      const access_token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET || '',
        {
          expiresIn: '1d',
        }
      );

      return res.status(201).json({
        data: { access_token },
        success: true,
        message: 'Registration Successful.',
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        success: false,
        message: 'Something went wrong',
        error,
      });
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req?.body;

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

      const isMatch: boolean = await bcrypt.compare(
        password,
        user?.password || ''
      );

      if (!isMatch) {
        return res.status(500).json({
          data: null,
          success: true,
          message: 'Email or password is wrong',
        });
      }

      const access_token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || '',
        {
          expiresIn: '1d',
        }
      );

      return res.status(200).json({
        data: { access_token },
        success: true,
        message: 'Logged in Successfully',
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        success: false,
        message: 'Something went wrong',
        error,
      });
    }
  };

  getUserDetails = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req;
      const user = await this.userModel.findById(userId);

      return res.status(200).json({
        data: user,
        success: true,
        message: '',
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        success: false,
        message: 'Something went wrong',
        error,
      });
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const users = await this.userModel
        .find({ _id: { $ne: req?.userId } })
        .select('-email -createdAt -updatedAt -__v');

      return res.status(200).json({
        data: users,
        success: true,
        message: '',
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        success: false,
        message: 'Something went wrong',
        error,
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      return res.status(200).json({
        data: {
          access_token: null,
        },
        success: true,
        message: 'Logged out Successfully',
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        success: false,
        message: 'Something went wrong',
        error,
      });
    }
  };
}

export default UserController;
