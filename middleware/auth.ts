import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Get token from header
  const token = req.header('authorization');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded: any = jwt.verify(token.slice(7), JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Something went wrong with the auth middleware', error);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
