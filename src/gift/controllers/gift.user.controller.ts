import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserGiftDetailResponseDto } from '../dtos/responses/users/gift-detail.response.dto';
import { UserGiftResponseDto } from '../dtos/responses/users/gift.response.dto';
import { GiftUserService } from '../services/gift.user.service';

@ApiTags('User Gifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gifts')
export class GiftUserController {
  constructor(private readonly userService: GiftUserService) {}

  @Get()
  @ApiOperation({ summary: 'List active gifts' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserGiftResponseDto] })
  async findAll(): Promise<UserGiftResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get active gift details' })
  @ApiResponse({ status: HttpStatus.OK, type: UserGiftDetailResponseDto })
  async findOne(@Param('id') id: string): Promise<UserGiftDetailResponseDto> {
    return this.userService.findOne(id);
  }
}
