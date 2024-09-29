import { authMiddleware } from '@middlewares/auth.middleware';
import { Add } from '@reaction/controllers/add-reaction';
import { Remove } from '@reaction/controllers/remove-reaction';
import express, { Router } from 'express';

class ReactionRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);
    this.router.delete('/post/reaction/:postId/:previousReaction', authMiddleware.checkAuthentication, Remove.prototype.reaction);
    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
