import type { BadgeTone } from '@/components/common/badge';
import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import type { FeeStatus, PaymentMethod } from '@/types/fees';
import { View } from '@/tw';

export const FEE_STATUS_LABEL: Record<FeeStatus, string> = {
  OUTSTANDING: 'Outstanding',
  PARTIALLY_PAID: 'Partially paid',
  PAID_IN_FULL: 'Paid in full',
};

const FEE_STATUS_TONE: Record<FeeStatus, BadgeTone> = {
  OUTSTANDING: 'warning',
  PARTIALLY_PAID: 'warning',
  PAID_IN_FULL: 'success',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  MOBILE_MONEY: 'Mobile Money',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  CHEQUE: 'Cheque',
};

export type FeeCardProps = {
  title: string;
  amount: number;
  currency: string;
  /** e.g. "Total: LRD 500" for a balance row, or "Bank Transfer · Aug 1, 2026"
   * for a payment-history row. */
  subtitle?: string;
  /** Renders a status badge — pass for a fee-rule balance row, omit for a
   * payment/collection row (a completed payment has no "status" of its own). */
  status?: FeeStatus;
  onPress?: () => void;
  /** Overrides the default themed surface (`Card`'s `backgroundElement`). */
  backgroundColor?: string;
  className?: string;
};

/** One fee-rule balance or one payment/collection row — flexible enough for
 * both `(student)/fees/balance.tsx` and `.../payment-history.tsx` rather
 * than needing two near-identical card components. */
export function FeeCard({
  title,
  amount,
  currency,
  subtitle,
  status,
  onPress,
  backgroundColor,
  className,
}: FeeCardProps) {
  return (
    <Card onPress={onPress} backgroundColor={backgroundColor} className={className}>
      <View className="flex-row items-center justify-between gap-2">
        <ThemedText type="smallBold" className="flex-1">
          {title}
        </ThemedText>
        <ThemedText type="smallBold">
          {currency} {amount.toLocaleString()}
        </ThemedText>
      </View>
      {subtitle && (
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      )}
      {status && <Badge label={FEE_STATUS_LABEL[status]} tone={FEE_STATUS_TONE[status]} />}
    </Card>
  );
}
