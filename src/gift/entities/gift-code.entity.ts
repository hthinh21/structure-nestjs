import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { GiftEntity } from './gift.entity';
import { BaseEntity } from '../../common/bases/base.entity';

@Entity({ name: 'gift_codes' })
export class GiftCodeEntity extends BaseEntity {
  @Column({ name: 'code', type: 'varchar', unique: true, length: 50 })
  code!: string;

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed!: boolean;

  @Column({ name: 'gift_id' })
  giftId!: string;

  @ManyToOne(() => GiftEntity, (gift) => gift.codes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gift_id' })
  gift!: GiftEntity;
}
