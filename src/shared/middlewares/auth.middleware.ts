import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';

import { config } from '@root/config';
import { NotAuthorizedError } from '@globals/helpers/error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

export class AuthMiddleware {
  public verifyUser(req: Request, res: Response, next: NextFunction): void {
    let token: string | undefined;

    // First check session cookie
    if (req.session?.jwt) {
      token = req.session.jwt;
    } else {
      // Fallback: Check Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    if (!token) {
      throw new NotAuthorizedError('Token is not available. Please login again.');
    }

    try {
      const payload: AuthPayload = JWT.verify(token, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
      next();
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid or expired. Please login again.');
    }
  }

  public checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route.');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
