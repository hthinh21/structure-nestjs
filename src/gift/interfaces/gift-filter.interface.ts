import type { GiftStatus } from '../enums/gift-status.enum';
import type { GiftType } from '../enums/gift-type.enum';

export interface IGiftFilter {
  type?: GiftType;
  status?: GiftStatus;
  search?: string;
}
