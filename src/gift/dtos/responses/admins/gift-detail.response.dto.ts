import { ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose, Type } from 'class-transformer';

import { AdminGiftResponseDto } from './gift.response.dto';

@Exclude()
export class AdminGiftCodeDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  code!: string;

  @ApiProperty()
  @Expose()
  isUsed!: boolean;
}

@Exclude()
export class AdminGiftDetailResponseDto extends AdminGiftResponseDto {
  @ApiProperty({ type: [AdminGiftCodeDto] })
  @Expose()
  @Type(() => AdminGiftCodeDto)
  codes!: AdminGiftCodeDto[];
}
