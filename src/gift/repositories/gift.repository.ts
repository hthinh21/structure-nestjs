import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseRepository } from '../../common/bases/base.repository';
import { GiftEntity } from '../entities/gift.entity';

@Injectable()
export class GiftRepository extends BaseRepository<GiftEntity> {
  constructor(
    @InjectRepository(GiftEntity)
    private readonly giftRepo: Repository<GiftEntity>,
  ) {
    super(giftRepo);
  }
}
