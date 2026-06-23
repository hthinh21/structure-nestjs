import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { GiftEntity } from './gift.entity';
import { BaseEntity } from '../../common/bases/base.entity';
import { GiftClaimStatus } from '../enums/gift-claim-status.enum';

@Entity({ name: 'gift_claims' })
export class GiftClaimEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'varchar', length: 50 })
  userId!: string;

  @Column({ name: 'gift_id' })
  giftId!: string;

  @Column({ name: 'code', type: 'varchar', nullable: true })
  code?: string;

  @Column({
    name: 'status',
    type: 'varchar',
    enum: GiftClaimStatus,
    default: GiftClaimStatus.PENDING,
  })
  status!: GiftClaimStatus;

  @Column({ name: 'claimed_at', type: 'datetime' })
  claimedAt!: Date;

  @ManyToOne(() => GiftEntity, (gift) => gift.claims, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'gift_id' })
  gift!: GiftEntity;
}
