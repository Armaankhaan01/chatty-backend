import { authMiddleware } from '@middlewares/auth.middleware';
import { postMiddleware } from '@middlewares/post.middleware';
import { Create } from '@post/controllers/create-post';
import { Delete } from '@post/controllers/delete-post';
import { Get } from '@post/controllers/get-posts';
import { Update } from '@post/controllers/update-post';
import express, { Router } from 'express';

class PostRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts);
    this.router.get('/post/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImages);
    this.router.get('/post/videos/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithVideos);

    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.createPost);
    this.router.post('/post/image/post', authMiddleware.checkAuthentication, Create.prototype.createPostWithImage);
    this.router.post('/post/video/post', authMiddleware.checkAuthentication, Create.prototype.postWithVideo);

    this.router.put('/post/:postId', authMiddleware.checkAuthentication, postMiddleware.checkAuthorizedForPost, Update.prototype.posts);
    this.router.put(
      '/post/image/:postId',
      authMiddleware.checkAuthentication,
      postMiddleware.checkAuthorizedForPost,
      Update.prototype.postWithImage
    );
    this.router.put(
      '/post/video/:postId',
      authMiddleware.checkAuthentication,
      postMiddleware.checkAuthorizedForPost,
      Update.prototype.postWithVideo
    );

    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, postMiddleware.checkAuthorizedForPost, Delete.prototype.posts);
    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
