import { RefreshControl, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export default function PaymentHistoryScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFeeRulesStatusQuery();

  const payments = data?.rules
    .flatMap((rule) => rule.collections)
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={payments?.length === 0}
        emptyMessage="No payments recorded yet."
        onRetry={refetch}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {payments?.map((payment) => (
            <ThemedView
              key={payment.id}
              type="backgroundElement"
              style={{ marginBottom: 8, gap: 4, borderRadius: 8, padding: 16 }}
            >
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
