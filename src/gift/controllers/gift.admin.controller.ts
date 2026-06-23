import { Body, Controller, Get, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateGiftRequestDto } from '../dtos/requests/admins/create.request.dto';
import { UpdateGiftRequestDto } from '../dtos/requests/admins/update.request.dto';
import { AdminGiftDetailResponseDto } from '../dtos/responses/admins/gift-detail.response.dto';
import { AdminGiftResponseDto } from '../dtos/responses/admins/gift.response.dto';
import { GiftAdminService } from '../services/gift.admin.service';

@ApiTags('Admin Gifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/gifts')
export class GiftAdminController {
  constructor(private readonly adminService: GiftAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new gift campaign' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AdminGiftResponseDto })
  async create(@Body() dto: CreateGiftRequestDto): Promise<AdminGiftResponseDto> {
    return this.adminService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all gifts' })
  @ApiResponse({ status: HttpStatus.OK, type: [AdminGiftResponseDto] })
  async findAll(): Promise<AdminGiftResponseDto[]> {
    return this.adminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gift detail' })
  @ApiResponse({ status: HttpStatus.OK, type: AdminGiftDetailResponseDto })
  async findOne(@Param('id') id: string): Promise<AdminGiftDetailResponseDto> {
    return this.adminService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a gift' })
  @ApiResponse({ status: HttpStatus.OK, type: AdminGiftResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGiftRequestDto,
  ): Promise<AdminGiftResponseDto> {
    return this.adminService.update(id, dto);
  }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiOperation({ summary: 'Delete a gift' })
  // @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Gift deleted successfully' })
  // async delete(@Param('id') id: string): Promise<void> {
  //   await this.adminService.delete(id);
  // }
}
