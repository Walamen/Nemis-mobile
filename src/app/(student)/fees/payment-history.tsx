import { RefreshControl, ScrollView } from 'react-native';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import { FeeCard, PAYMENT_METHOD_LABEL } from '@/components/cards/fee-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { CardBackgroundColor } from '@/theme';

export default function PaymentHistoryScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFeeRulesStatusQuery();

  const payments = data?.rules
    .flatMap((rule) => rule.collections)
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Payment History" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={payments?.length === 0}
        onRetry={refetch}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }}
            title="No payments yet"
            description="Your payment history will appear here once a payment is recorded."
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {payments?.map((payment) => (
            <FeeCard
              key={payment.id}
              title={payment.feeRuleName}
              amount={payment.amount}
              currency={data?.currency ?? ''}
              subtitle={`${PAYMENT_METHOD_LABEL[payment.method]} · ${new Date(payment.paidAt).toLocaleDateString()}`}
              backgroundColor={CardBackgroundColor}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
