import { NotAuthorizedError } from '@globals/helpers/error-handler';
import { PostCache } from '@services/redis/post.cache';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS from 'http-status-codes';

const postCache: PostCache = new PostCache();

export class PostMiddleware {
  public async checkAuthorizedForPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const cachedPost = await postCache.getPostFromCache(postId);

      if (!cachedPost || cachedPost.userId !== req.currentUser?.userId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'Unauthorized: You are not authorized.' });
      }

      next();
    } catch (error) {
      console.error('Authorization check failed:', error);
      throw new NotAuthorizedError('Internal server error');
    }
  }
}

export const postMiddleware: PostMiddleware = new PostMiddleware();
