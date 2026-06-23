import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PaginationDto } from '../../common/dtos/requests/pagination-request.dto';
import { PaginatedResponseDto } from '../../common/dtos/responses/paginated-response.dto';
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
}
