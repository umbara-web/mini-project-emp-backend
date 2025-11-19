import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient';
import dotenv from 'dotenv';

dotenv.config();

// Define a type for JWT payload
interface JwtPayload {
  id: string;
  role: 'CUSTOMER' | 'ORGANIZER';
}

/**
 * AUTHENTICATE MIDDLEWARE
 * Verifies JWT token and attaches user to req.user
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token user' });
    }

    // Attach full user object to request (matches Request.user type)
    req.user = user;

    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * AUTHORIZE ORGANIZER
 * Allows only organizers to continue
 */
export const authorizeOrganizer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'ORGANIZER') {
    return res
      .status(403)
      .json({ success: false, message: 'Access denied: organizer only' });
  }
  return next();
};

/**
 * AUTHORIZE CUSTOMER
 * Allows only customers to continue
 */
export const authorizeCustomer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'CUSTOMER') {
    return res
      .status(403)
      .json({ success: false, message: 'Access denied: customer only' });
  }
  return next();
};
