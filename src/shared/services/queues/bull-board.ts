import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import Queue from 'bull';

const bullAdapters: BullAdapter[] = [];

export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');

export const registerQueue = (queue: Queue.Queue) => {
  bullAdapters.push(new BullAdapter(queue));
};

export const initBullBoard = () => {
  createBullBoard({
    queues: bullAdapters,
    serverAdapter,
  });
};
