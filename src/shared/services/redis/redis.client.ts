import { createClient } from 'redis';
import { config } from '@root/config';

export const redisClient = createClient({
  url: config.REDIS_HOST,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});
