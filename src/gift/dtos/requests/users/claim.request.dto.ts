import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimGiftRequestDto {
  @ApiProperty({ example: 'gift-uuid-here' })
  @IsString()
  @IsNotEmpty()
  giftId!: string;
}
