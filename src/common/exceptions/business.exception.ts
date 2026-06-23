import { BadRequestException } from '@nestjs/common';

export class BusinessException extends BadRequestException {
  constructor(message: string, error?: string) {
    super(message, error ?? 'BusinessRuleViolation');
  }
}
