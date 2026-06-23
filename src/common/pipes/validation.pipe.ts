import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
  type ValidationError,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value) as Record<string, unknown>;
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: this.formatErrors(errors),
      });
    }
    return object;
  }

  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: unknown[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    errors.forEach((err) => {
      const property = err.property;
      const constraints = err.constraints;
      if (constraints) {
        result[property] = Object.values(constraints);
      }
    });
    return result;
  }
}
