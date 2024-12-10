import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const access_token: string | undefined | null =
      req?.headers?.authorization || '';

    if (!access_token) {
      return res.status(401).json({ cause: 'No token provided' });
    }

    const decoded: any = jwt.verify(
      access_token,
      process?.env?.JWT_SECRET || ''
    );
    req.userId = decoded.id;

    next();
  } catch (error: any) {
    console.log('auth middleware err:', error?.name, error?.message);

    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: 'Login expired' });
    } else if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid Login' });
    }

    return res.status(401).json({ message: 'Something went wrong' });
  }
};

export default isAuthenticated;
