export type FeeCollection = {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  paidAt: string;
  feeRuleName: string;
};

export type FeeRuleStatus = {
  feeRule: { id: string; name: string; amount: number; currency: string; category: string };
  totalRequired: number;
  totalPaid: number;
  balance: number;
  isPaid: boolean;
  status: 'OUTSTANDING' | 'PARTIALLY_PAID' | 'PAID_IN_FULL';
  collections: FeeCollection[];
};

export type FeeRulesStatus = {
  rules: FeeRuleStatus[];
  currency: string;
  totalRequired: number;
  totalPaid: number;
  totalBalance: number;
};
