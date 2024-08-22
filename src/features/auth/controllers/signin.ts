import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { StatusCodes } from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { authService } from '@root/shared/services/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { signinSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@services/db/user.service';

export class SignIn {
  @joiValidation(signinSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username } = req.body;
    const existingUser: IAuthDocument | null = await authService.getUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const comparePassword: boolean = await existingUser.comparePassword(req.body.password);
    if (!comparePassword) {
      throw new BadRequestError('Invalid credentials');
    }
    console.log(existingUser._id);

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    console.log(user);

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor,

        iat: Date.now(),
      },
      config.JWT_TOKEN!,
    );
    req.session = { jwt: userJwt };
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      avatarColor: existingUser.avatarColor,
      uId: existingUser.uId,
      createdAt: existingUser.createdAt,
    } as IUserDocument;
    res.status(StatusCodes.OK).json({ user: userDocument, token: userJwt, message: 'User logged in successfully' });
  }
}
