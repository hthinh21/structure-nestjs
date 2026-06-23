import { ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose } from 'class-transformer';

import { GiftClaimStatus } from '../../../enums/gift-claim-status.enum';

@Exclude()
export class ClaimedGiftResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  giftId!: string;

  @ApiProperty()
  @Expose()
  code?: string;

  @ApiProperty({ enum: GiftClaimStatus })
  @Expose()
  status!: GiftClaimStatus;

  @ApiProperty()
  @Expose()
  claimedAt!: Date;
}
