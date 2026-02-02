import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from './base.queue';
import { authWorker } from '@workers/auth.worker';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
  }

  public addAuthUserJob(name: string, value: IAuthJob): void {
    this.addJob(name, value);
  }
}

let authQueue: AuthQueue;

export const getAuthQueue = () => {
  if (!authQueue) {
    authQueue = new AuthQueue();
  }
  return authQueue;
};
