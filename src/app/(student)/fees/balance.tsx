import { RefreshControl, ScrollView, View } from 'react-native';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import { FeeCard } from '@/components/cards/fee-card';
import { StatCard } from '@/components/cards/stat-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';

export default function BalanceScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFeeRulesStatusQuery();

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
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <StatCard
              label="Total Balance"
              value={`${data?.currency ?? ''} ${(data?.totalBalance ?? 0).toLocaleString()}`}
            />
          </View>

          {data?.rules?.map((rule) => (
            <FeeCard
              key={rule.feeRule.id}
              title={rule.feeRule.name}
              amount={rule.balance}
              currency={data.currency}
              subtitle={`Total: ${data.currency} ${rule.totalRequired.toLocaleString()}`}
              status={rule.status}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
