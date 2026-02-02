import { config } from '@root/config';
import Redis from 'ioredis';

export const bullClient = new Redis(config.REDIS_HOST as string);


// Subscriber (MUST disable ready check + retries)
export const bullSubscriber = new Redis(config.REDIS_HOST as string, {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

// Blocking client (same rules)
export const bullBlockingClient = new Redis(config.REDIS_HOST as string, {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});