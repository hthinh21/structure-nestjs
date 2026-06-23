import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseRepository } from '../../common/bases/base.repository';
import { GiftEntity } from '../entities/gift.entity';
import { GiftStatus } from '../enums/gift-status.enum';

@Injectable()
export class GiftRepository extends BaseRepository<GiftEntity> {
  constructor(
    @InjectRepository(GiftEntity)
    private readonly giftRepository: Repository<GiftEntity>,
  ) {
    super(giftRepository);
  }

  async findActiveGifts(): Promise<GiftEntity[]> {
    return this.findAll({
      where: { status: GiftStatus.ACTIVE },
    });
  }
}
