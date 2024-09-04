import Logger from 'bunyan';
import { BaseCache } from './base.cache';
import { config } from '@root/config';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { ServerError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';

const log: Logger = config.createLogger('postCache');

export type TPostCacheMultiType = {
  [key: string]: IPostDocument[];
};

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;

    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      bgColor,
      post,
      privacy,
      gifUrl,
      feelings,
      imgVersion,
      imgId,
      commentsCount,
      createdAt,
      reactions
    } = createdPost;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'profilePicture',
      `${profilePicture}`,
      'bgColor',
      `${bgColor}`,
      'post',
      `${post}`,
      'privacy',
      `${privacy}`,
      'gifUrl',
      `${gifUrl}`,
      'feelings',
      `${feelings}`
    ];

    const secondList: string[] = [
      'commentsCount',
      `${commentsCount}`,
      'reactions',
      `${JSON.stringify(reactions)}`,
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'createdAt',
      `${createdAt}`
    ];
    const dataToSave: string[] = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
      multi.HSET(`posts:${key}`, dataToSave);
      const count: number = parseInt(postCount[0], 10) + 1;
      multi.HSET(`users:${currentUserId}`, ['postsCount', count]);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new Error('Failed to connect to redis');
    }
  }

  public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: IPostDocument[] = (await multi.exec()) as unknown as IPostDocument[];
      for (const post of replies) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`);
        post.reactions = Helpers.parseJson(`${post.reactions}`);
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));
      }
      return replies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again.');
    }
  }

  public async getTotalPostsFromCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('post');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again.');
    }
  }

  public async getPostsWithImagesFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: IPostDocument[] = (await multi.exec()) as unknown as IPostDocument[];
      const postWithImages: IPostDocument[] = [];

      for (const post of replies) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentsCount = Helpers.parseJson(`${post.commentsCount}`);
          post.reactions = Helpers.parseJson(`${post.reactions}`);
          post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));
          postWithImages.push(post);
        }
      }
      return postWithImages;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again.');
    }
  }
  public async getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: IPostDocument[] = (await multi.exec()) as unknown as IPostDocument[];
      const postReplies: IPostDocument[] = [];

      for (const post of replies) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`);
        post.reactions = Helpers.parseJson(`${post.reactions}`);
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));
        postReplies.push(post);
      }
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again.');
    }
  }

  public async getTotalUserPostsFromCache(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCOUNT('post', uId, uId);
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again.');
    }
  }
}
