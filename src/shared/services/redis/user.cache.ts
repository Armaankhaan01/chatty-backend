import { ServerError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';
const log: Logger = config.createLogger('userCache');
export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }
  /**
   * Saves a user to the Redis cache.
   *
   * This function takes a key, user ID, and the created user object as input.
   * It extracts the necessary information from the user object, formats it into
   * three lists, and then combines these lists into a single array.
   * The function then attempts to save this data to the Redis cache using the
   * provided key and user ID.
   *
   * @param {string} key - The key to use when saving the user to the cache.
   * @param {string} userId - The ID of the user being saved.
   * @param {IUserDocument} createdUser - The user object containing the data to be saved.
   * @return {Promise<void>} A promise that resolves when the data has been saved.
   */
  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social,
    } = createdUser;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'postsCount',
      `${postsCount}`,
      'createdAt',
      `${createdAt}`,
    ];

    const secondList: string[] = [
      'blocked',
      JSON.stringify(blocked),
      'blockedBy',
      JSON.stringify(blockedBy),
      'profilePicture',
      `${profilePicture}`,

      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      JSON.stringify(notifications),
      'social',
      JSON.stringify(social),
    ];
    const thirdList: string[] = [
      'work',
      `${work}`,
      'location',
      `${location}`,
      'school',
      `${school}`,
      'quote',
      `${quote}`,
      'bgImageVersion',
      `${bgImageVersion}`,
      'bgImageId',
      `${bgImageId}`,
    ];

    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];
    log.info(dataToSave);
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try Again.');
    }
  }
}
