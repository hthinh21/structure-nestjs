import { ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose } from 'class-transformer';

import { GiftType } from '../../../enums/gift-type.enum';

@Exclude()
export class UserGiftResponseDto {
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

  @ApiProperty()
  @Expose()
  hasStock!: boolean;
}
