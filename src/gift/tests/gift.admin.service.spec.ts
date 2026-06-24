import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { GiftStatus } from '../enums/gift-status.enum';
import { GiftType } from '../enums/gift-type.enum';
import { GiftCodeRepository } from '../repositories/gift-code.repository';
import { GiftRepository } from '../repositories/gift.repository';
import { GiftAdminService } from '../services/gift.admin.service';

import type { GiftCodeEntity } from '../entities/gift-code.entity';
import type { GiftEntity } from '../entities/gift.entity';

describe('GiftAdminService', () => {
  let service: GiftAdminService;
  let giftRepository: jest.Mocked<GiftRepository>;
  let codeRepository: jest.Mocked<GiftCodeRepository>;

  const mockGift: GiftEntity = {
    id: 'gift-id-123',
    name: 'Voucher 100k',
    description: 'Voucher discount',
    type: GiftType.VOUCHER,
    status: GiftStatus.ACTIVE,
    stock: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    codes: [],
    claims: [],
  } as unknown as GiftEntity;

  beforeEach(async () => {
    const mockGiftRepo = {
      create: jest.fn().mockImplementation((dto: unknown) => dto as GiftEntity),
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      getRawRepository: jest.fn(),
    };
    mockGiftRepo.getRawRepository.mockReturnValue(mockGiftRepo);

    const mockCodeRepo = {
      create: jest.fn().mockImplementation((dto: unknown) => dto as GiftCodeEntity),
      save: jest.fn(),
      getRawRepository: jest.fn(),
    };
    mockCodeRepo.getRawRepository.mockReturnValue(mockCodeRepo);

    const mockDataSource = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiftAdminService,
        { provide: GiftRepository, useValue: mockGiftRepo },
        { provide: GiftCodeRepository, useValue: mockCodeRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<GiftAdminService>(GiftAdminService);
    giftRepository = module.get(GiftRepository);
    codeRepository = module.get(GiftCodeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a gift campaign and generate codes if stock > 0', async () => {
      const createDto = {
        name: 'Voucher 100k',
        description: 'Voucher discount',
        type: GiftType.VOUCHER,
        stock: 2,
      };

      giftRepository.save.mockResolvedValue(mockGift);

      const result = await service.create(createDto);

      expect(giftRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        type: createDto.type,
        stock: createDto.stock,
        description: createDto.description,
      });
      expect(giftRepository.save).toHaveBeenCalled();
      expect(codeRepository.create).toHaveBeenCalledTimes(2);
      expect(codeRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(mockGift.name);
    });
  });

  describe('findAll', () => {
    it('should return paginated gifts list', async () => {
      giftRepository.findAndCount.mockResolvedValue([[mockGift], 1]);

      const result = await service.findAll({ page: 1, limit: 10, skip: 0 });

      expect(giftRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return gift detail by id', async () => {
      giftRepository.findOne.mockResolvedValue({ ...mockGift, codes: [] } as unknown as GiftEntity);

      const result = await service.findOne('gift-id-123');

      expect(giftRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'gift-id-123' },
        relations: { codes: true },
      });
      expect(result.id).toBe(mockGift.id);
    });

    it('should throw NotFoundException if gift does not exist', async () => {
      giftRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update gift properties', async () => {
      giftRepository.findOne.mockResolvedValue(mockGift);
      giftRepository.save.mockImplementation(async (g) => g);

      const updateDto = { name: 'Voucher 200k', stock: 10 };
      const result = await service.update('gift-id-123', updateDto);

      expect(giftRepository.findOne).toHaveBeenCalledWith({ where: { id: 'gift-id-123' } });
      expect(giftRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Voucher 200k');
    });
  });
});
