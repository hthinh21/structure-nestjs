import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dtos/requests/pagination-request.dto';
import { PaginatedResponseDto } from '../../common/dtos/responses/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClaimedGiftResponseDto } from '../dtos/responses/users/claimed-gift.response.dto';
import { UserGiftDetailResponseDto } from '../dtos/responses/users/gift-detail.response.dto';
import { UserGiftResponseDto } from '../dtos/responses/users/gift.response.dto';
import { GiftUserService } from '../services/gift.user.service';

import type { IUserValidated } from '../../auth/interfaces/jwt.interface';

@ApiTags('User Gifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gifts')
export class GiftUserController {
  constructor(private readonly userService: GiftUserService) {}

  @Get()
  @ApiOperation({ summary: 'List active gifts with pagination' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResponseDto })
  async findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<UserGiftResponseDto>> {
    return this.userService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get active gift details' })
  @ApiResponse({ status: HttpStatus.OK, type: UserGiftDetailResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserGiftDetailResponseDto> {
    return this.userService.findOne(id);
  }

  @Post(':id/claim')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Claim a gift by ID' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ClaimedGiftResponseDto })
  async claim(
    @Param('id', ParseUUIDPipe) giftId: string,
    @CurrentUser() user: IUserValidated,
  ): Promise<ClaimedGiftResponseDto> {
    return this.userService.claim(giftId, user.id);
  }
}
