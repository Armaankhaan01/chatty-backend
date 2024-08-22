import Joi, { ObjectSchema } from 'joi';

const signinSchema: ObjectSchema = Joi.object({
  username: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Username must be a string',
    'string.min': 'Invalid Credentials',
    'string.max': 'Invalid Credentials',
    'string.empty': 'Username is a required field',
  }),
  password: Joi.string().required().min(8).max(16).messages({
    'string.base': 'Password must be a string',
    'string.min': 'Invalid Credentials',
    'string.max': 'Invalid Credentials',
    'string.empty': 'Password is a required field',
  }),
});

export { signinSchema };
