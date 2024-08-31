import { Request, Response } from 'express';
import * as cloudinaryUploads from '@globals/helpers/cloudinary-upload';
import { authMock, authMockRequests, authMockResponse } from '@mocks/auth.mock';
import { SignUp } from '../signup';
import { CustomError } from '@globals/helpers/error-handler';
import { authService } from '@services/db/auth.service';
import { UserCache } from '@services/redis/user.cache';

jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/user.cache');
jest.mock('@services/queues/user.queue');
jest.mock('@services/queues/auth.queue');
jest.mock('@globals/helpers/cloudinary-upload');

describe('SignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should return an error if username is not available', async () => {
    const req: Request = authMockRequests(
      {},
      {
        username: '',
        email: 'manny@test.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('Should throw an error if username length is less than minimum length', async () => {
    const req: Request = authMockRequests(
      {},
      {
        username: 'man',
        email: 'manny@test.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username must be at least 4 characters long');
    });
  });

  it('Should throw an error if username length is greater than maximum length', async () => {
    const req: Request = authMockRequests(
      {},
      {
        username: 'manny1234',
        email: 'manny@test.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username must be at most 8 characters long');
    });
  });
  it('Should throw an error if email is not available', async () => {
    const req: Request = authMockRequests(
      {},
      {
        username: 'manny',
        email: '',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  it('Should throw an error if password length is less than minimum length', async () => {
    const req: Request = authMockRequests(
      {},
      {
        username: 'manny',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password must be at least 8 characters long');
    });
  });

  it('Should throw an error if password length is greater than maximum length', async () => {
    const req: Request = authMockRequests(
      {},
      {
        username: 'manny',
        email: 'manny@test.com',
        password: 'qwerty1234567890123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password must be at most 16 characters long');
    });
  });

  it('Should throw an error if avatarColor is not valid', async () => {
    const req: Request = authMockRequests(
      {},
      {
        username: 'manny',
        email: 'manny@test.com',
        password: 'qwerty123',
        avatarColor: '',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('AvatarColor is a required field');
    });
  });

  it('Should throw an error if avatarImage is not valid', async () => {
    const req: Request = authMockRequests(
      {},
      {
        username: 'manny',
        email: 'manny@test.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: ''
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('AvatarImage is a required field');
    });
  });

  it('Should throw unauthorized error if user already exists', async () => {
    const req: Request = authMockRequests(
      {},
      {
        username: 'manny',
        email: 'manny@test.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('Should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequests(
      {},
      {
        username: 'manny',
        email: 'manny@test.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234737373', public_id: '123456' }));

    await SignUp.prototype.create(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(req.session?.jwt).toEqual(expect.any(String));
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  });
});
