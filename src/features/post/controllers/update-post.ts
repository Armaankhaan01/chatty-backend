import { Request, Response } from 'express';
import { PostCache } from '@services/redis/post.cache';
import HTTP_STATUS from 'http-status-codes';
import { postQueue } from '@services/queues/post.queue';
import { socketIOPostObject } from '@sockets/post.socket';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { postSchema, postWithImageSchema, postWithVideoSchema } from '@post/schemes/post.schemes';
import { IPostDocument } from '@post/interfaces/post.interface';
import { UploadApiResponse } from 'cloudinary';
import { deleteFile, uploads, videoUpload } from '@globals/helpers/cloudinary-upload';
import { BadRequestError } from '@globals/helpers/error-handler';
import { imageQueue } from '@services/queues/image.queue';

const postCache: PostCache = new PostCache();

export class Update {
  @joiValidation(postSchema)
  public async posts(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId,
      imgVersion,
      videoId: '',
      videoVersion: ''
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      Update.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
  }

  @joiValidation(postWithVideoSchema)
  public async postWithVideo(req: Request, res: Response): Promise<void> {
    const { videoId, videoVersion } = req.body;
    if (videoId && videoVersion) {
      Update.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with video updated successfully' });
  }

  private async updatePost(req: Request): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture, videoId, videoVersion } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: imgId ? imgId : '',
      imgVersion: imgVersion ? imgVersion : '',
      videoId: videoId ? videoId : '',
      videoVersion: videoVersion ? videoVersion : ''
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
  }

  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image, imgId, video, videoId } = req.body;
    const { postId } = req.params;
    let result: UploadApiResponse;
    if (image && imgId) {
      result = (await uploads(image, imgId, true, true)) as UploadApiResponse;
    } else if (video && videoId) {
      result = (await videoUpload(video, videoId, true, true)) as UploadApiResponse;
    } else if (video && imgId) {
      deleteFile(imgId, 'image', true);
      result = (await videoUpload(video)) as UploadApiResponse;
    } else if (image && videoId) {
      deleteFile(videoId, 'video', true);
      result = (await uploads(image)) as UploadApiResponse;
    } else {
      result = image ? ((await uploads(image)) as UploadApiResponse) : ((await videoUpload(video)) as UploadApiResponse);
    }

    if (!result?.public_id) {
      return result;
    }

    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: image ? result.public_id : '',
      imgVersion: image ? result.version.toString() : '',
      videoId: video ? result.public_id : '',
      videoVersion: video ? result.version.toString() : ''
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });

    if (image) {
      imageQueue.addImageJob('addImageToDB', {
        key: `${req.currentUser!.userId}`,
        imgId: result.public_id,
        imgVersion: result.version.toString()
      });
    }
    return result;
  }
}
