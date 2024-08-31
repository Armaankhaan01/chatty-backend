import { IUserDocument } from '@user/interfaces/user.interface';

export const mockExistingUser = {
  notification: {
    message: true,
    reaction: true,
    comments: true,
    follows: true
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  blocked: [],
  blockedBy: [],
  followersCount: 0,
  followingCount: 2,
  postsCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'https://placeholder.com/500x500',
  _id: '62d6d8e5f8a5a5a5a5a5a5a5',
  work: '',
  school: '',
  quote: '',
  location: '',
  createdAt: new Date()
} as unknown as IUserDocument;

export const existingUser = {
  notification: {
    message: true,
    reaction: true,
    comments: true,
    follows: false
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  blocked: [],
  blockedBy: [],
  followersCount: 0,
  followingCount: 2,
  postsCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'https://placeholder.com/500x500',
  _id: '62d6d8e5f8a5a5a5a5a5a5a5',
  username: 'Manny',
  email: 'manny@me.com',
  avatarColor: '#9c27b0',
  uId: '1621613119252066',
  work: '',
  school: '',
  quote: '',
  location: '',
  createdAt: new Date()
} as unknown as IUserDocument;

export const searchedUserMock = {
  _id: '62d6d8e5f8a5a5a5a5a5a5a6',
  username: 'Kenny',
  email: 'kenny@me.com',
  avatarColor: '#9c27b0',
  uId: '1621613119252067',
  createdAt: new Date(),
  postsCount: 0
};

export const userJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
