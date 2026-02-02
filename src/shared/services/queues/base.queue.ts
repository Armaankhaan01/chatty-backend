import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IEmailJob, IUserJob } from '@user/interfaces/user.interface';
import { IPostJobData } from '@post/interfaces/post.interface';
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ICommentJob } from '@root/features/comment/interfaces/comment.interface';
import { IFollowerJobData } from '@follower/interfaces/follower.interface';
import { INotificationJobData } from '@notification/interfaces/notification.interface';
import { IFileImageJobData } from '@image/interfaces/image.interface';
import { IChatJobData, IMessageData } from '@chat/interfaces/chat.interface';
import { bullBlockingClient, bullClient, bullSubscriber } from './bull.redis';
import { registerQueue } from './bull-board';

type IBaseJobData =
  | IAuthJob
  | IUserJob
  | IEmailJob
  | IPostJobData
  | IReactionJob
  | ICommentJob
  | IFollowerJobData
  | INotificationJobData
  | IFileImageJobData
  | IChatJobData
  | IMessageData;

export abstract class BaseQueue {
  protected queue: Queue.Queue;
  protected log: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, {
      createClient: (type) => {
        switch (type) {
          case 'client':
            return bullClient;
          case 'subscriber':
            return bullSubscriber;
          case 'bclient':
            return bullBlockingClient;
          default:
            return bullClient;
        }
      }
    });

    registerQueue(this.queue);
    this.log = config.createLogger(`${queueName} Queue`);

    this.queue.on('completed', (job: Job) => {
      job.remove(); // remove job from queue
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Completed ${queueName} Job: ${jobId}`);
    });
    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`stalled ${queueName} Job: ${jobId}`);
    });
  }

  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 10000 } });
  }

  protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callback);
  }
}
