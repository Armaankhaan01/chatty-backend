import { userWorker } from '@root/shared/workers/user.worker';
import { BaseQueue } from './base.queue';
import { IUserJob } from '@user/interfaces/user.interface';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
  }
  public addUserJob(name: string, data: IUserJob): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
