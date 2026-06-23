import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../common/bases/base.entity';

@Entity({ name: 'gift_campaigns' })
export class GiftCampaignEntity extends BaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 150 })
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'start_date', type: 'datetime' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'datetime' })
  endDate!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
