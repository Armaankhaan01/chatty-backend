import { BaseQueue } from './base.queue';
import { IFollowerJobData } from '@follower/interfaces/follower.interface';
import { followerWorker } from '@workers/follower.worker';

class FollowerQueue extends BaseQueue {
  constructor() {
    super('followers');
    this.processJob('addFollowerToDB', 5, followerWorker.addFollowerToDB);
    this.processJob('removeFollowerFromDB', 5, followerWorker.removeFollowerFromDB);
  }

  public addFollowerJob(name: string, data: IFollowerJobData): void {
    this.addJob(name, data);
  }
}

export const followerQueue: FollowerQueue = new FollowerQueue();
