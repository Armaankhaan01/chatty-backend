import { JoiRequestValidationError } from '@global/helpers/error-handler';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

type IJoiDecorator = (target: unknown, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return (_target: unknown, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value as (...args: unknown[]) => Promise<unknown>;

    descriptor.value = async function (...args: [Request, ...unknown[]]) {
      const req = args[0] as Request;

      const { error } = schema.validate(req.body);
      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }

      const result = await originalMethod.apply(this, args);
      return result;
    };
    return descriptor;
  };
}
