import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { ScrollView } from '@/tw';

const STATUS_LABEL: Record<string, string> = {
  OUTSTANDING: 'Outstanding',
  PARTIALLY_PAID: 'Partially paid',
  PAID_IN_FULL: 'Paid in full',
};

export default function BalanceScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFeeRulesStatusQuery();

  return (
    <SafeAreaView className="flex-1">
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ThemedView type="backgroundElement" className="mb-4 gap-1 rounded-card p-4">
            <ThemedText type="small" themeColor="textSecondary">
              Total balance
            </ThemedText>
            <ThemedText type="subtitle" className="text-2xl">
              {data?.currency} {data?.totalBalance.toLocaleString()}
            </ThemedText>
          </ThemedView>

          {data?.rules.map((rule) => (
            <ThemedView
              key={rule.feeRule.id}
              type="backgroundElement"
              className="mb-2 gap-1 rounded-card p-4"
            >
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
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
