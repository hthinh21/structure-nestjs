import { Column, Entity, OneToMany } from 'typeorm';

import { GiftClaimEntity } from './gift-claim.entity';
import { GiftCodeEntity } from './gift-code.entity';
import { BaseEntity } from '../../common/bases/base.entity';
import { GiftStatus } from '../enums/gift-status.enum';
import { GiftType } from '../enums/gift-type.enum';

@Entity({ name: 'gifts' })
export class GiftEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'type', type: 'varchar', enum: GiftType, default: GiftType.PHYSICAL })
  type!: GiftType;

  @Column({ name: 'status', type: 'varchar', enum: GiftStatus, default: GiftStatus.ACTIVE })
  status!: GiftStatus;

  @Column({ name: 'stock', type: 'int', default: 0 })
  stock!: number;

  @OneToMany(() => GiftCodeEntity, (code) => code.gift)
  codes!: GiftCodeEntity[];

  @OneToMany(() => GiftClaimEntity, (claim) => claim.gift)
  claims!: GiftClaimEntity[];
}
