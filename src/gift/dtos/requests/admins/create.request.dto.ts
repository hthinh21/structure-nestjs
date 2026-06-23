import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

import { GiftType } from '../../../enums/gift-type.enum';

export class CreateGiftRequestDto {
  @ApiProperty({ example: 'Summer Voucher' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Summer discount voucher' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: GiftType, example: GiftType.VOUCHER })
  @IsEnum(GiftType)
  type!: GiftType;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock!: number;
}
