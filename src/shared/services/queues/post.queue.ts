import { BaseQueue } from './base.queue';
import { IPostJobData } from '@post/interfaces/post.interface';
import { postWorker } from '@workers/post.worker';

class PostQueue extends BaseQueue {
  constructor() {
    super('posts');
    this.processJob('addPostToDB', 5, postWorker.savePostToDB);
  }

  public addPostJob(name: string, value: IPostJobData): void {
    this.addJob(name, value);
  }
}

export const postQueue: PostQueue = new PostQueue();
