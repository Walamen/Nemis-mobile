export type PaymentMethod =
  'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHEQUE';

export type FeeCollection = {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  paidAt: string;
  feeRuleName: string;
};

export type FeeCategory =
  'TUITION' | 'ACTIVITY' | 'TRANSPORT' | 'UNIFORM' | 'BOOKS' | 'LUNCH' | 'EXAM' | 'OTHER';

export type FeeStatus = 'OUTSTANDING' | 'PARTIALLY_PAID' | 'PAID_IN_FULL';

export type FeeRuleStatus = {
  feeRule: { id: string; name: string; amount: number; currency: string; category: FeeCategory };
  totalRequired: number;
  totalPaid: number;
  balance: number;
  isPaid: boolean;
  status: FeeStatus;
  collections: FeeCollection[];
};

export type FeeRulesStatus = {
  rules: FeeRuleStatus[];
  currency: string;
  totalRequired: number;
  totalPaid: number;
  totalBalance: number;
};
