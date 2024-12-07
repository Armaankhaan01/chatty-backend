import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/post.interface';
import { ObjectId } from 'mongodb';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { postSchema, postWithImageSchema } from '@post/schemes/post.schemes';
import { PostCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post.socket';
import { postQueue } from '@services/queues/post.queue';
import { uploads } from '@globals/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '@globals/helpers/error-handler';
import { imageQueue } from '@services/queues/image.queue';

const postCache: PostCache = new PostCache();

export class Create {
  @joiValidation(postSchema)
  public async createPost(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;

    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      bgColor,
      post,
      privacy,
      gifUrl,
      feelings,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      reactions: {
        like: 0,
        happy: 0,
        love: 0,
        wow: 0,
        sad: 0,
        angry: 0
      },
      createdAt: new Date()
    } as IPostDocument;

    socketIOPostObject.emit('add post', createdPost);

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost
    });

    postQueue.addPostJob('addPostToDB', { value: createdPost, key: req.currentUser!.userId });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async createPostWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;

    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError(result.message);
    }

    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      bgColor,
      post,
      privacy,
      gifUrl,
      feelings,
      commentsCount: 0,
      imgVersion: result.version.toString(),
      imgId: result.public_id,
      reactions: {
        like: 0,
        happy: 0,
        love: 0,
        wow: 0,
        sad: 0,
        angry: 0
      },
      createdAt: new Date()
    } as IPostDocument;

    socketIOPostObject.emit('add post', createdPost);

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost
    });

    postQueue.addPostJob('addPostToDB', { value: createdPost, key: req.currentUser!.userId });

    imageQueue.addImageJob('addImageToDB', {
      key: `${req.currentUser!.userId}`,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    });

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with Image successfully' });
  }
}
