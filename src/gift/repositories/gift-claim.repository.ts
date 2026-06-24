import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseRepository } from '../../common/bases/base.repository';
import { GiftClaimEntity } from '../entities/gift-claim.entity';

@Injectable()
export class GiftClaimRepository extends BaseRepository<GiftClaimEntity> {
  constructor(
    @InjectRepository(GiftClaimEntity)
    private readonly giftClaimRepo: Repository<GiftClaimEntity>,
  ) {
    super(giftClaimRepo);
  }
}
