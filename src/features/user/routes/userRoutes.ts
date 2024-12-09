import express, { Router } from 'express';
import { Get } from '@user/controllers/get-profile';
import { authMiddleware } from '@middlewares/auth.middleware';

class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/user/all/:page', authMiddleware.checkAuthentication, Get.prototype.all);

    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
