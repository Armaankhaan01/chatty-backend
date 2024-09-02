import Logger from 'bunyan';
import { BaseCache } from './base.cache';
import { config } from '@root/config';
import { ISavePostToCache } from '@post/interfaces/post.interface';

const log: Logger = config.createLogger('postCache');

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
}
