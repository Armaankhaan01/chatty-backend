import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { PostCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post.socket';
import { postQueue } from '@services/queues/post.queue';

const postCache: PostCache = new PostCache();

export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    socketIOPostObject.emit('delete post', postId);

    await postCache.deletePostFromCache(postId, `${req.currentUser!.userId}`);

    postQueue.addPostJob('deletePostFromDB', {
      keyOne: postId,
      keyTwo: req.currentUser!.userId
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}
