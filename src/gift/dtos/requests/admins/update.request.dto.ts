import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { GiftStatus } from '../../../enums/gift-status.enum';
import { GiftType } from '../../../enums/gift-type.enum';

export class UpdateGiftRequestDto {
  @ApiPropertyOptional({ example: 'Updated Summer Voucher' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: GiftType })
  @IsEnum(GiftType)
  @IsOptional()
  type?: GiftType;

  @ApiPropertyOptional({ enum: GiftStatus })
  @IsEnum(GiftStatus)
  @IsOptional()
  status?: GiftStatus;

  @ApiPropertyOptional({ example: 120 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;
}
