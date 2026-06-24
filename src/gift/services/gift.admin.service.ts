import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { plainToInstance } from 'class-transformer';
import { DataSource, Repository } from 'typeorm';

import { PaginationDto } from '../../common/dtos/requests/pagination-request.dto';
import { PaginatedResponseDto } from '../../common/dtos/responses/paginated-response.dto';
import { paginate } from '../../common/utils/pagination.util';
import { generateRandomString } from '../../common/utils/string.util';
import { CreateGiftRequestDto } from '../dtos/requests/admins/create.request.dto';
import { UpdateGiftRequestDto } from '../dtos/requests/admins/update.request.dto';
import { AdminGiftDetailResponseDto } from '../dtos/responses/admins/gift-detail.response.dto';
import { AdminGiftResponseDto } from '../dtos/responses/admins/gift.response.dto';
import { GiftCodeEntity } from '../entities/gift-code.entity';
import { GiftEntity } from '../entities/gift.entity';

@Injectable()
export class GiftAdminService {
  private readonly logger = new Logger(GiftAdminService.name);

  constructor(
    @InjectRepository(GiftEntity)
    private readonly giftRepository: Repository<GiftEntity>,
    @InjectRepository(GiftCodeEntity)
    private readonly codeRepository: Repository<GiftCodeEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateGiftRequestDto): Promise<AdminGiftResponseDto> {
    this.logger.log(`Creating new gift: ${dto.name}`);
    const gift = this.giftRepository.create({
      name: dto.name,
      type: dto.type,
      stock: dto.stock,
      ...(dto.description ? { description: dto.description } : {}),
    });
    const saved: GiftEntity = await this.giftRepository.save(gift);

    if (dto.stock > 0) {
      const codes = Array.from({ length: dto.stock }).map(() =>
        this.codeRepository.create({
          code: generateRandomString(10).toUpperCase(),
          giftId: saved.id,
        }),
      );
      await this.codeRepository.save(codes);
    }

    this.logger.log(`Gift created successfully with ID: ${saved.id}`);
    return plainToInstance(AdminGiftResponseDto, saved);
  }

  async findAll(dto: PaginationDto): Promise<PaginatedResponseDto<AdminGiftResponseDto>> {
    return paginate(
      this.giftRepository,
      dto,
      { order: { createdAt: 'DESC' } },
      AdminGiftResponseDto,
    );
  }

  async findOne(id: string): Promise<AdminGiftDetailResponseDto> {
    const gift = await this.giftRepository.findOne({
      where: { id },
      relations: { codes: true },
    });
    if (!gift) {
      throw new NotFoundException(`Gift with ID "${id}" not found`);
    }
    return plainToInstance(AdminGiftDetailResponseDto, gift);
  }

  async update(id: string, dto: UpdateGiftRequestDto): Promise<AdminGiftResponseDto> {
    this.logger.log(`Updating gift ID: ${id}`);

    const gift = await this.giftRepository.findOne({ where: { id } });
    if (!gift) {
      throw new NotFoundException(`Gift with ID "${id}" not found`);
    }

    const { name, description, stock, status } = dto;
    Object.assign(gift, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(stock !== undefined && { stock }),
      ...(status !== undefined && { status }),
    });

    const updated = await this.giftRepository.save(gift);
    this.logger.log(`Gift ID: ${id} updated successfully`);
    return plainToInstance(AdminGiftResponseDto, updated);
  }

  // async delete(id: string): Promise<void> {
  //   this.logger.log(`Deleting gift ID: ${id}`);
  //   const gift = await this.giftRepository.findOne({ where: { id } });
  //   if (!gift) {
  //     throw new NotFoundException(`Gift with ID "${id}" not found`);
  //   }
  //   // Hard delete justified: clean up test data / obsolete items for demo
  //   await this.giftRepository.remove(gift);
  //   this.logger.log(`Gift ID: ${id} deleted successfully`);
  // }
}
