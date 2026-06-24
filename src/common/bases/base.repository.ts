import type { BaseEntity } from './base.entity';
import type { Repository, FindManyOptions, FindOneOptions } from 'typeorm';

export abstract class BaseRepository<T extends BaseEntity> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  create(entity: Partial<T>): T {
    return this.repository.create(entity as T);
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.repository.findAndCount(options);
  }

  getRawRepository(): Repository<T> {
    return this.repository;
  }
}
