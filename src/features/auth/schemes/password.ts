import Joi, { ObjectSchema } from 'joi';

const emailSchema: ObjectSchema = Joi.object({
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Email must be a valid email address',
    'string.empty': 'Email is a required field'
  })
});

const passwordSchema: ObjectSchema = Joi.object({
  password: Joi.string().required().min(8).max(16).messages({
    'string.base': 'Password must be a string',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must be at most 16 characters long',
    'string.empty': 'Password is a required field'
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Password should match',
    'any.required': 'ConfirmPassword is a required field'
  })
});

export { emailSchema, passwordSchema };
