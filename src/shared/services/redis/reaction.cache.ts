import Logger from 'bunyan';
import { BaseCache } from './base.cache';
import { config } from '@root/config';
import { ServerError } from '@globals/helpers/error-handler';
import { IReactionDocument, IReactions } from '@reaction/interfaces/reaction.interface';
import { Helpers } from '@globals/helpers/helpers';
import { find } from 'lodash';

const log: Logger = config.createLogger('reactionsCache');

export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionsCache');
  }

  public async saveOrUpdatePostReaction(key: string, reaction: IReactionDocument, type: string, previousReaction?: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postReactions = await this.getPostReactions(key);

      // Handle previous reaction removal
      if (previousReaction) {
        postReactions[previousReaction] = Math.max((postReactions[previousReaction] || 1) - 1, 0);
        await this.removePreviousReactionFromList(key, reaction.username);
      }

      // Add new reaction
      if (type) {
        postReactions[type] = (postReactions[type] || 0) + 1;
        await this.client.lPush(`reactions:${key}`, JSON.stringify(reaction));
      }

      // Update the post hash with new reaction counts in one atomic operation
      await this.client.hSet(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  private async getPostReactions(key: string): Promise<IReactions> {
    const postHash = (await this.client.hGet(`posts:${key}`, 'reactions')) as string;
    return Helpers.parseJson(postHash) as IReactions;
  }

  private async removePreviousReactionFromList(key: string, username: string): Promise<void> {
    const response = await this.client.lRange(`reactions:${key}`, 0, -1);
    const previousReaction = this.getPreviousReaction(response, username);
    if (previousReaction) {
      await this.client.lRem(`reactions:${key}`, 1, JSON.stringify(previousReaction));
    }
  }

  private getPreviousReaction(response: string[], username: string): IReactionDocument | undefined {
    const list: IReactionDocument[] = response.map((item) => Helpers.parseJson(item) as IReactionDocument);
    return find(list, (reaction: IReactionDocument) => reaction.username === username);
  }
}
