import { plainToInstance, type ClassConstructor } from 'class-transformer';

import { PaginatedResponseDto } from '../dtos/responses/paginated-response.dto';

import type { PaginationDto } from '../dtos/requests/pagination-request.dto';
import type { FindManyOptions, Repository, ObjectLiteral } from 'typeorm';

export async function paginate<T extends ObjectLiteral, R>(
  repository: Repository<T>,
  paginationDto: PaginationDto,
  options: FindManyOptions<T> = {},
  transformTo?: ClassConstructor<R>,
): Promise<PaginatedResponseDto<R>> {
  const [data, total] = await repository.findAndCount({
    ...options,
    skip: paginationDto.skip,
    take: paginationDto.limit,
  });

  const transformedData = transformTo
    ? plainToInstance(transformTo, data)
    : (data as unknown as R[]);

  return new PaginatedResponseDto<R>(
    transformedData,
    total,
    paginationDto.page,
    paginationDto.limit,
  );
}
