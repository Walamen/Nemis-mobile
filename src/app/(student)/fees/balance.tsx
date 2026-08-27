import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import { FeeCard } from '@/components/cards/fee-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { CardBackgroundColor, Palette } from '@/theme';

export default function BalanceScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFeeRulesStatusQuery();
  const paidRatio = data && data.totalRequired > 0 ? data.totalPaid / data.totalRequired : 0;

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Current Balance" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.rules?.length === 0}
        onRetry={refetch}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
            title="No fees due"
            description="You don't have any fee rules assigned yet."
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          contentContainerStyle={{ paddingBottom: 32 }}
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

          {data?.rules?.map((rule) => (
            <FeeCard
              key={rule.feeRule.id}
              title={rule.feeRule.name}
              amount={rule.balance}
              currency={data.currency}
              subtitle={`${data.currency} ${rule.totalPaid.toLocaleString()} paid of ${data.currency} ${rule.totalRequired.toLocaleString()}`}
              status={rule.status}
              backgroundColor={CardBackgroundColor}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    marginBottom: 16,
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
