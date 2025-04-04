import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { ReactionCache } from '@services/redis/reaction.cache';
import { reactionQueue } from '@services/queues/reaction.queue';
import { reactionMockRequest, reactionMockResponse } from '@mocks/reactions.mock';
import { Add } from '../add-reaction';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/reaction.cache');

describe('AddReaction', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        previousReaction: 'love',
        profilePicture: 'http://place-hold.it/500x500',
        userTo: '60263f14648fed5246e322d9',
        type: 'like',
        postReactions: {
          like: 1,
          love: 0,
          happy: 0,
          wow: 0,
          sad: 0,
          angry: 0
        }
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();
    const spy = jest.spyOn(ReactionCache.prototype, 'saveOrUpdatePostReaction');
    const reactionSpy = jest.spyOn(reactionQueue, 'addReactionJob');

    await Add.prototype.reaction(req, res);
    expect(ReactionCache.prototype.saveOrUpdatePostReaction).toHaveBeenCalledWith(
      spy.mock.calls[0][0],
      spy.mock.calls[0][1],
      spy.mock.calls[0][2],
      spy.mock.calls[0][3]
    );
    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith(reactionSpy.mock.calls[0][0], reactionSpy.mock.calls[0][1]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reaction added successfully'
    });
  });
});
