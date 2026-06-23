import { NotFoundException } from '@nestjs/common';

export class ResourceNotFoundException extends NotFoundException {
  constructor(resourceName: string, identifier?: string | number) {
    const msg = identifier
      ? `${resourceName} with identifier "${identifier}" was not found`
      : `${resourceName} not found`;
    super(msg, 'ResourceNotFound');
  }
}
