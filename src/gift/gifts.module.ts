import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GiftAdminController } from './controllers/gift.admin.controller';
import { GiftUserController } from './controllers/gift.user.controller';
import { GiftCampaignEntity } from './entities/gift-campaign.entity';
import { GiftClaimEntity } from './entities/gift-claim.entity';
import { GiftCodeEntity } from './entities/gift-code.entity';
import { GiftEntity } from './entities/gift.entity';
import { GiftClaimRepository } from './repositories/gift-claim.repository';
import { GiftCodeRepository } from './repositories/gift-code.repository';
import { GiftRepository } from './repositories/gift.repository';
import { GiftAdminService } from './services/gift.admin.service';
import { GiftUserService } from './services/gift.user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GiftEntity, GiftCodeEntity, GiftClaimEntity, GiftCampaignEntity]),
  ],
  controllers: [GiftAdminController, GiftUserController],
  providers: [
    GiftAdminService,
    GiftUserService,
    GiftRepository,
    GiftCodeRepository,
    GiftClaimRepository,
  ],
  exports: [GiftAdminService, GiftUserService],
})
export class GiftsModule {}
