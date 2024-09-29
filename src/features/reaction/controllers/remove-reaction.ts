import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ReactionCache } from '@services/redis/reaction.cache';
import { IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { reactionQueue } from '@services/queues/reaction.queue';

const reactionCache: ReactionCache = new ReactionCache();

export class Remove {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction } = req.params;
    const username = req.currentUser!.username;
    await reactionCache.saveOrUpdatePostReaction(postId, { username } as IReactionDocument, '', previousReaction);

    const databaseReactionData: IReactionJob = {
      postId,
      username,
      previousReaction
    };
    reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post' });
  }
}
