import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';

export class SignOut {
  public async signOut(req: Request, res: Response): Promise<void> {
    req.session = null;
    res.status(HTTP_STATUS.OK).json({ message: 'User signed out successfully', user: {}, token: '' });
  }
}
