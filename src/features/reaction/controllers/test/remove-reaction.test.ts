import { Request, Response } from 'express';
import { reactionMockRequest, reactionMockResponse } from '@root/mocks/reactions.mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { ReactionCache } from '@services/redis/reaction.cache';
import { reactionQueue } from '@services/queues/reaction.queue';
import { Remove } from '@reaction/controllers/remove-reaction';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/reaction.cache');

describe('Remove', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest({}, {}, authUserPayload, {
      postId: '66f69fdbadbb7b5fcd170b7c',
      previousReaction: 'like'
    }) as Request;
    const res: Response = reactionMockResponse();
    jest.spyOn(ReactionCache.prototype, 'saveOrUpdatePostReaction');
    const spy = jest.spyOn(reactionQueue, 'addReactionJob');

    await Remove.prototype.reaction(req, res);
    expect(ReactionCache.prototype.saveOrUpdatePostReaction).toHaveBeenCalledWith(
      '66f69fdbadbb7b5fcd170b7c',
      {
        username: req.currentUser?.username
      },
      '',
      req.params.previousReaction
    );
    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reaction removed from post'
    });
  });
});
