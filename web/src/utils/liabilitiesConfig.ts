import type { LiabilityType } from '../types';

export const LIABILITY_META: Record<LiabilityType, { label: string }> = {
  MORTGAGE: { label: 'Mortgage' },
  LOAN: { label: 'Loan' },
  PERSONAL_DEBT: { label: 'Personal Debt' },
};

export const getLiabilityLabel = (type: LiabilityType): string => {
  return LIABILITY_META[type]?.label ?? type;
};