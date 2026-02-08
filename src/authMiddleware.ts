import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const headerUserId = req.headers['x-user-id'];
    
    if (!headerUserId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing x-user-id header'
      });
    }
    
    const userId = parseInt(headerUserId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'x-user-id must be a number'
      });
    }
    
    req.user = { userId };
    
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};