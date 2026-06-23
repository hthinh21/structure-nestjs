import type { GiftClaimStatus } from '../enums/gift-claim-status.enum';

export interface IGiftClaimResult {
  claimId: string;
  code: string;
  status: GiftClaimStatus;
  claimedAt: Date;
}
