import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ReactionCache } from '@services/redis/reaction.cache';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { reactionService } from '@services/db/reaction.service';
import mongoose from 'mongoose';

const reactionCache: ReactionCache = new ReactionCache();

export class Get {
  public async reactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    const cachedReactions: [IReactionDocument[], number] = await reactionCache.getReactionsFromCache(postId);
    const reactions: [IReactionDocument[], number] = cachedReactions[0].length
      ? cachedReactions
      : await reactionService.getPostReactions({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post reactions', reactions: reactions[0], count: reactions[1] });
  }

  public async singleReactionByUsername(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const username = req.currentUser!.username;
    const cachedReactions: [IReactionDocument, number] | [] = await reactionCache.getSingleReactionByUsernameFromCache(postId, username);
    const reactions: [IReactionDocument, number] | [] = cachedReactions[0]
      ? cachedReactions
      : await reactionService.getSinglePostReactionByUsername(postId, username);

    res.status(HTTP_STATUS.OK).json({
      message: 'Single post reaction by username',
      reactions: reactions.length ? reactions[0] : {},
      count: reactions.length ? reactions[1] : 0
    });
  }

  public async reactionByUsername(req: Request, res: Response): Promise<void> {
    const username = req.currentUser!.username;
    const reactions: IReactionDocument[] = await reactionService.getReactionsByUsername(username);

    res.status(HTTP_STATUS.OK).json({ message: 'All user reactions by username', reactions: reactions });
  }
}
