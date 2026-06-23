import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { plainToInstance } from 'class-transformer';
import { DataSource, Repository } from 'typeorm';

import { PaginationDto } from '../../common/dtos/requests/pagination-request.dto';
import { PaginatedResponseDto } from '../../common/dtos/responses/paginated-response.dto';
import { ClaimedGiftResponseDto } from '../dtos/responses/users/claimed-gift.response.dto';
import { UserGiftDetailResponseDto } from '../dtos/responses/users/gift-detail.response.dto';
import { UserGiftResponseDto } from '../dtos/responses/users/gift.response.dto';
import { GiftClaimEntity } from '../entities/gift-claim.entity';
import { GiftCodeEntity } from '../entities/gift-code.entity';
import { GiftEntity } from '../entities/gift.entity';
import { GiftClaimStatus } from '../enums/gift-claim-status.enum';
import { GiftStatus } from '../enums/gift-status.enum';
import { GiftType } from '../enums/gift-type.enum';

@Injectable()
export class GiftUserService {
  private readonly logger = new Logger(GiftUserService.name);

  constructor(
    @InjectRepository(GiftEntity)
    private readonly giftRepository: Repository<GiftEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(dto: PaginationDto): Promise<PaginatedResponseDto<UserGiftResponseDto>> {
    const [gifts, total] = await this.giftRepository.findAndCount({
      where: { status: GiftStatus.ACTIVE },
      skip: dto.skip,
      take: dto.limit,
      order: { createdAt: 'DESC' },
    });

    const data = gifts.map((g) => {
      const response = plainToInstance(UserGiftResponseDto, g);
      response.hasStock = g.stock > 0;
      return response;
    });

    return new PaginatedResponseDto(data, total, dto.page, dto.limit);
  }

  async findOne(id: string): Promise<UserGiftDetailResponseDto> {
    const gift = await this.giftRepository.findOne({
      where: { id, status: GiftStatus.ACTIVE },
    });
    if (!gift) {
      throw new NotFoundException(`Gift with ID "${id}" not found`);
    }
    const dto = plainToInstance(UserGiftDetailResponseDto, gift);
    dto.hasStock = gift.stock > 0;
    return dto;
  }

  async claim(giftId: string, userId: string): Promise<ClaimedGiftResponseDto> {
    this.logger.log(`User "${userId}" is claiming gift "${giftId}"`);

    return this.dataSource.transaction(async (manager) => {
      const gift = await manager.findOne(GiftEntity, {
        where: { id: giftId, status: GiftStatus.ACTIVE },
      });
      if (!gift) {
        throw new NotFoundException(`Gift with ID "${giftId}" not found`);
      }
      if (gift.stock <= 0) {
        throw new BadRequestException('Gift is out of stock');
      }

      let claimCode: string | undefined;

      if (gift.type !== GiftType.PHYSICAL) {
        const codeEntity = await manager.findOne(GiftCodeEntity, {
          where: { giftId: gift.id, isUsed: false },
        });
        if (!codeEntity) {
          throw new BadRequestException('No codes available for this gift');
        }
        codeEntity.isUsed = true;
        await manager.save(codeEntity);
        claimCode = codeEntity.code;
      }

      gift.stock -= 1;
      await manager.save(gift);

      const claim = manager.create(GiftClaimEntity, {
        userId,
        giftId: gift.id,
        status: GiftClaimStatus.APPROVED,
        claimedAt: new Date(),
        ...(claimCode ? { code: claimCode } : {}),
      });
      const savedClaim = await manager.save(claim);

      this.logger.log(`Gift "${giftId}" claimed by user "${userId}", claim ID: ${savedClaim.id}`);
      return plainToInstance(ClaimedGiftResponseDto, savedClaim);
    });
  }
}
