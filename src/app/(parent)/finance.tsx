import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useGetChildFeeRulesStatusQuery } from '@/api/parent/fees-api';
import { FeeCard, PAYMENT_METHOD_LABEL } from '@/components/cards/fee-card';
import { ChildGate } from '@/components/common/child-gate';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { forSelectedChild } from '@/utils/selected-child';

/** The selected child's fees — the Student Balance + Payment History in one screen. */
function Finance() {
  const theme = useTheme();
  const { selectedChildId } = useSelectedChild();
  const { data, error, isLoading, isFetching, isError, refetch } = forSelectedChild(
    useGetChildFeeRulesStatusQuery(selectedChildId ?? '', { skip: !selectedChildId }),
  );
  const paidRatio = data && data.totalRequired > 0 ? data.totalPaid / data.totalRequired : 0;
  const paidPercent = Math.min(100, Math.round(paidRatio * 100));

  const payments = [...(data?.rules.flatMap((rule) => rule.collections) ?? [])].sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
  );

  return (
    <>
      <ChildSwitcher inset />
      <QueryState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={data?.rules.length === 0}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={4} lines={2} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
            title="No fees assigned"
            description="This child doesn't have any fee rules assigned yet."
          />
        }
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {data && (
            <View style={styles.hero}>
              <ThemedText type="small" themeColor="textSecondary">
                Outstanding balance
              </ThemedText>
              <ThemedText type="subtitle" style={styles.heroValue}>
                {data.currency} {data.totalBalance.toLocaleString()}
              </ThemedText>
              <View
                style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}
                accessibilityRole="progressbar"
                accessibilityLabel="Fees paid"
                accessibilityValue={{ min: 0, max: 100, now: paidPercent }}
              >
                <View style={[styles.progressFill, { width: `${paidPercent}%` }]} />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {data.currency} {data.totalPaid.toLocaleString()} paid of {data.currency}{' '}
                {data.totalRequired.toLocaleString()}
              </ThemedText>
            </View>
          )}

          <SectionHeader title="Fee breakdown" />
          {data?.rules.map((rule) => (
            <FeeCard
              key={rule.feeRule.id}
              title={rule.feeRule.name}
              amount={rule.balance}
              currency={data.currency}
              subtitle={`${data.currency} ${rule.totalPaid.toLocaleString()} paid of ${data.currency} ${rule.totalRequired.toLocaleString()}`}
              status={rule.status}
              backgroundColor={theme.card}
              className="mb-2"
            />
          ))}

          <SectionHeader title="Payment history" />
          {payments.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              No payments recorded yet.
            </ThemedText>
          ) : (
            payments.map((payment) => (
              <FeeCard
                key={payment.id}
                title={payment.feeRuleName}
                amount={payment.amount}
                currency={data?.currency ?? ''}
                subtitle={`${PAYMENT_METHOD_LABEL[payment.method]} · ${new Date(payment.paidAt).toLocaleDateString()}`}
                backgroundColor={theme.card}
                className="mb-2"
              />
            ))
          )}
        </ScrollView>
      </QueryState>
    </>
  );
}

export default function FinanceScreen() {
  return (
    <AppScreen scroll={false} contentClassName="">
      {/* Reached from the Menu sheet / dashboard, not a visible tab — keep
          the default back button so there's a clear way back. */}
      <AppHeader title="Finance" />
      <ChildGate loadingFallback={<SkeletonList count={4} lines={2} className="px-4 pt-4" />}>
        <Finance />
      </ChildGate>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 30,
  },
  progressTrack: {
    height: 8,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: Palette.secondary,
  },
});
