import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildFeeRulesStatusQuery } from '@/api/parent/fees-api';
import { FeeCard, PAYMENT_METHOD_LABEL } from '@/components/cards/fee-card';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { SectionHeader } from '@/components/layout/section-header';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { Palette } from '@/theme';

export default function FinanceScreen() {
  const { selectedChildId } = useSelectedChild();
  const { data, isLoading, isFetching, isError, refetch } = useGetChildFeeRulesStatusQuery(
    selectedChildId ?? '',
    { skip: !selectedChildId },
  );
  const paidRatio = data && data.totalRequired > 0 ? data.totalPaid / data.totalRequired : 0;

  const payments = data?.rules
    .flatMap((rule) => rule.collections)
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppHeader title="Finance" showBack={false} />
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ChildSwitcher />

          {data && (
            <View style={styles.hero}>
              <ThemedText type="small" themeColor="textSecondary">
                Outstanding balance
              </ThemedText>
              <ThemedText type="subtitle" style={styles.heroValue}>
                {data.currency} {data.totalBalance.toLocaleString()}
              </ThemedText>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, Math.round(paidRatio * 100))}%` },
                  ]}
                />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {data.currency} {data.totalPaid.toLocaleString()} paid of {data.currency}{' '}
                {data.totalRequired.toLocaleString()}
              </ThemedText>
            </View>
          )}

          <SectionHeader title="Fee breakdown" />
          {data?.rules?.map((rule) => (
            <FeeCard
              key={rule.feeRule.id}
              title={rule.feeRule.name}
              amount={rule.balance}
              currency={data.currency}
              subtitle={`${data.currency} ${rule.totalPaid.toLocaleString()} paid of ${data.currency} ${rule.totalRequired.toLocaleString()}`}
              status={rule.status}
              className="mb-2"
            />
          ))}

          <SectionHeader title="Payment history" />
          {payments?.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              No payments recorded yet.
            </ThemedText>
          )}
          {payments?.map((payment) => (
            <FeeCard
              key={payment.id}
              title={payment.feeRuleName}
              amount={payment.amount}
              currency={data?.currency ?? ''}
              subtitle={`${PAYMENT_METHOD_LABEL[payment.method]} · ${new Date(payment.paidAt).toLocaleDateString()}`}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 30,
  },
  progressTrack: {
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#E0E1E6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: Palette.secondary,
  },
});
