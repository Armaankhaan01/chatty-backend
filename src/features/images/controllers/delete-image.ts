import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { socketIOImageObject } from '@sockets/image.socket';
import { imageQueue } from '@services/queues/image.queue';
import { imageService } from '@services/db/image.service';
import { IFileImageDocument } from '@image/interfaces/image.interface';

const userCache: UserCache = new UserCache();

export class Delete {
  public async image(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;
    socketIOImageObject.emit('delete image', imageId);
    imageQueue.addImageJob('removeImageFromDB', {
      imageId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
  }

  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const image: IFileImageDocument = await imageService.getImageByBackgroundId(req.params.bgImageId);
    socketIOImageObject.emit('delete image', image?._id);
    const bgImageId: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'bgImageId',
      ''
    ) as Promise<IUserDocument>;
    const bgImageVersion: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'bgImageVersion',
      ''
    ) as Promise<IUserDocument>;
    (await Promise.all([bgImageId, bgImageVersion])) as [IUserDocument, IUserDocument];

    imageQueue.addImageJob('removeImageFromDB', {
      imageId: image?._id as string
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
  }
}
