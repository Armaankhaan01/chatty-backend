import Logger from 'bunyan';
import { config } from '@root/config';
import { redisClient } from './redis.client';

export abstract class BaseCache {
  protected client = redisClient;
  protected log: Logger;

  constructor(cacheName: string) {
    this.log = config.createLogger(cacheName);
  }
}
