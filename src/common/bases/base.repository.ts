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

  async create(entity: Partial<T>): Promise<T> {
    const newEntity = this.repository.create(entity as T);
    return this.repository.save(newEntity);
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }
}
