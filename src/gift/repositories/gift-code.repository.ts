import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseRepository } from '../../common/bases/base.repository';
import { GiftCodeEntity } from '../entities/gift-code.entity';

@Injectable()
export class GiftCodeRepository extends BaseRepository<GiftCodeEntity> {
  constructor(
    @InjectRepository(GiftCodeEntity)
    private readonly giftCodeRepo: Repository<GiftCodeEntity>,
  ) {
    super(giftCodeRepo);
  }
}
