import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DataSource, type EntityManager } from 'typeorm';

import { GiftStatus } from '../enums/gift-status.enum';
import { GiftType } from '../enums/gift-type.enum';
import { GiftRepository } from '../repositories/gift.repository';
import { GiftUserService } from '../services/gift.user.service';

import type { GiftCodeEntity } from '../entities/gift-code.entity';
import type { GiftEntity } from '../entities/gift.entity';

describe('GiftUserService', () => {
  let service: GiftUserService;
  let giftRepository: jest.Mocked<GiftRepository>;
  let dataSource: jest.Mocked<DataSource>;

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

  const mockCode: GiftCodeEntity = {
    id: 'code-id-123',
    code: 'PROMO100',
    giftId: 'gift-id-123',
    isUsed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    gift: mockGift,
  } as unknown as GiftCodeEntity;

  beforeEach(async () => {
    const mockGiftRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      getRawRepository: jest.fn(),
    };
    mockGiftRepo.getRawRepository.mockReturnValue(mockGiftRepo);

    const mockManager = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation(async <E>(entity: E): Promise<E> => entity),
      create: jest.fn().mockImplementation(<T>(entityClass: unknown, data: T): T => data),
    };

    const mockDataSourceInstance = {
      transaction: jest
        .fn()
        .mockImplementation(
          (
            isolationOrCb: string | ((manager: EntityManager) => Promise<unknown>),
            cb?: (manager: EntityManager) => Promise<unknown>,
          ) => {
            if (typeof isolationOrCb === 'function') {
              return isolationOrCb(mockManager as unknown as EntityManager);
            }
            if (cb) {
              return cb(mockManager as unknown as EntityManager);
            }
            return Promise.resolve();
          },
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiftUserService,
        { provide: GiftRepository, useValue: mockGiftRepo },
        { provide: DataSource, useValue: mockDataSourceInstance },
      ],
    }).compile();

    service = module.get<GiftUserService>(GiftUserService);
    giftRepository = module.get(GiftRepository);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return only active gifts', async () => {
      giftRepository.findAndCount.mockResolvedValue([[mockGift], 1]);

      const result = await service.findAll({ page: 1, limit: 10, skip: 0 });

      expect(giftRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: GiftStatus.ACTIVE },
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.hasStock).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return an active gift details', async () => {
      giftRepository.findOne.mockResolvedValue(mockGift);

      const result = await service.findOne('gift-id-123');

      expect(giftRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'gift-id-123', status: GiftStatus.ACTIVE },
      });
      expect(result.id).toBe(mockGift.id);
    });

    it('should throw NotFoundException if active gift not found', async () => {
      giftRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('claim', () => {
    it('should claim a voucher gift successfully and return claimed code', async () => {
      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockGift) // first findOne: GiftEntity
          .mockResolvedValueOnce(mockCode), // second findOne: GiftCodeEntity
        save: jest.fn().mockImplementation(async (entity: { claimedAt?: Date }) => {
          if (entity.claimedAt) {
            return { ...entity, id: 'claim-id-123' };
          } // returned claim
          return entity;
        }),
        create: jest.fn().mockImplementation((entityClass: unknown, data: unknown) => data),
      };
      dataSource.transaction.mockImplementationOnce(
        (
          isolationOrCb: string | ((manager: EntityManager) => Promise<unknown>),
          cb?: (manager: EntityManager) => Promise<unknown>,
        ) => {
          if (typeof isolationOrCb === 'function') {
            return isolationOrCb(mockManager as unknown as EntityManager);
          }
          if (cb) {
            return cb(mockManager as unknown as EntityManager);
          }
          return Promise.resolve();
        },
      );

      const result = await service.claim('gift-id-123', 'user-id-456');

      expect(mockManager.findOne).toHaveBeenCalledTimes(2);
      expect(mockManager.save).toHaveBeenCalledTimes(3); // saves code, gift, claim
      expect(result.id).toBe('claim-id-123');
      expect(result.code).toBe('PROMO100');
    });

    it('should throw NotFoundException if gift campaign is not active', async () => {
      const mockManager = {
        findOne: jest.fn().mockResolvedValueOnce(null),
      };
      dataSource.transaction.mockImplementationOnce(
        (
          isolationOrCb: string | ((manager: EntityManager) => Promise<unknown>),
          cb?: (manager: EntityManager) => Promise<unknown>,
        ) => {
          if (typeof isolationOrCb === 'function') {
            return isolationOrCb(mockManager as unknown as EntityManager);
          }
          if (cb) {
            return cb(mockManager as unknown as EntityManager);
          }
          return Promise.resolve();
        },
      );

      await expect(service.claim('gift-id-123', 'user-id-456')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if gift is out of stock', async () => {
      const outOfStockGift = { ...mockGift, stock: 0 } as GiftEntity;
      const mockManager = {
        findOne: jest.fn().mockResolvedValueOnce(outOfStockGift),
      };
      dataSource.transaction.mockImplementationOnce(
        (
          isolationOrCb: string | ((manager: EntityManager) => Promise<unknown>),
          cb?: (manager: EntityManager) => Promise<unknown>,
        ) => {
          if (typeof isolationOrCb === 'function') {
            return isolationOrCb(mockManager as unknown as EntityManager);
          }
          if (cb) {
            return cb(mockManager as unknown as EntityManager);
          }
          return Promise.resolve();
        },
      );

      await expect(service.claim('gift-id-123', 'user-id-456')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
