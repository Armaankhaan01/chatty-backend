import Joi, { ObjectSchema } from 'joi';

const signinSchema: ObjectSchema = Joi.object({
  username: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Username must be a string',
    'string.min': 'Username must be at least 4 characters long',
    'string.max': 'Username must be at most 8 characters long',
    'string.empty': 'Username is a required field',
  }),
  password: Joi.string().required().min(8).max(16).messages({
    'string.base': 'Password must be a string',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must be at most 16 characters long',
    'string.empty': 'Password is a required field',
  }),
});

export { signinSchema };
