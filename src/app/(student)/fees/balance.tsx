import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';


const STATUS_LABEL: Record<string, string> = {
  OUTSTANDING: 'Outstanding',
  PARTIALLY_PAID: 'Partially paid',
  PAID_IN_FULL: 'Paid in full',
};

export default function BalanceScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFeeRulesStatusQuery();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ThemedView type="backgroundElement" style={{ marginBottom: 16, gap: 4, borderRadius: 8, padding: 16 }}>
            <ThemedText type="small" themeColor="textSecondary">
              Total balance
            </ThemedText>
            <ThemedText type="subtitle" style={{ fontSize: 24 }}>
              {data?.currency} {data?.totalBalance?.toLocaleString()}
            </ThemedText>
          </ThemedView>

          {data?.rules?.map((rule) => (
            <ThemedView
              key={rule.feeRule.id}
              type="backgroundElement"
              style={{ marginBottom: 8, gap: 4, borderRadius: 8, padding: 16 }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
