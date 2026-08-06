import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildFeeRulesStatusQuery } from '@/api/parent/fees-api';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useSelectedChild } from '@/hooks/use-selected-child';

const STATUS_LABEL: Record<string, string> = {
  OUTSTANDING: 'Outstanding',
  PARTIALLY_PAID: 'Partially paid',
  PAID_IN_FULL: 'Paid in full',
};

export default function FinanceScreen() {
  const { selectedChildId } = useSelectedChild();
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetChildFeeRulesStatusQuery(selectedChildId ?? '', { skip: !selectedChildId });

  const payments = data?.rules
    .flatMap((rule) => rule.collections)
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ChildSwitcher />

          <ThemedView type="backgroundElement" className="mb-4 gap-1 rounded-card p-4">
            <ThemedText type="small" themeColor="textSecondary">
              Outstanding balance
            </ThemedText>
            <ThemedText type="subtitle" style={{ fontSize: 24 }}>
              {data?.currency} {data?.totalBalance?.toLocaleString()}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {data?.currency} {data?.totalPaid?.toLocaleString()} paid of {data?.currency}{' '}
              {data?.totalRequired?.toLocaleString()}
            </ThemedText>
          </ThemedView>

          <ThemedText type="sectionHeading" className="mb-2">
            Fee breakdown
          </ThemedText>
          {data?.rules?.map((rule) => (
            <ThemedView key={rule.feeRule.id} type="backgroundElement" className="mb-2 gap-1 rounded-card p-4">
              <ThemedView className="flex-row items-center justify-between">
                <ThemedText type="smallBold">{rule.feeRule.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {STATUS_LABEL[rule.status] ?? rule.status}
                </ThemedText>
              </ThemedView>
              <ThemedText type="small">
                Balance: {data.currency} {rule.balance.toLocaleString()}
              </ThemedText>
            </ThemedView>
          ))}

          <ThemedText type="sectionHeading" className="mb-2 mt-4">
            Payment history
          </ThemedText>
          {payments?.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              No payments recorded yet.
            </ThemedText>
          )}
          {payments?.map((payment) => (
            <ThemedView key={payment.id} type="backgroundElement" className="mb-2 gap-1 rounded-card p-4">
              <ThemedView className="flex-row items-center justify-between">
                <ThemedText type="smallBold">{payment.feeRuleName}</ThemedText>
                <ThemedText type="smallBold">
                  {data?.currency} {payment.amount.toLocaleString()}
                </ThemedText>
              </ThemedView>
              <ThemedText type="small" themeColor="textSecondary">
                {payment.method} · {new Date(payment.paidAt).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
