import { ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose } from 'class-transformer';

import { GiftStatus } from '../../../enums/gift-status.enum';
import { GiftType } from '../../../enums/gift-type.enum';

@Exclude()
export class AdminGiftResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  description?: string;

  @ApiProperty({ enum: GiftType })
  @Expose()
  type!: GiftType;

  @ApiProperty({ enum: GiftStatus })
  @Expose()
  status!: GiftStatus;

  @ApiProperty()
  @Expose()
  stock!: number;

  @ApiProperty()
  @Expose()
  createdAt!: Date;
}
