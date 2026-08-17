import type { Href } from 'expo-router';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import { HubCard } from '@/components/cards/hub-card';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ScrollView } from '@/tw';

export default function FeesMenuScreen() {
  const { data } = useGetFeeRulesStatusQuery();
  const paymentCount = data?.rules.flatMap((rule) => rule.collections).length;

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Finance" showBack={false} />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 10 }}>
        <HubCard
          icon={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
          title="Current Balance"
          description="What's outstanding, partially paid, or paid in full, fee by fee."
          href={'/fees/balance' as Href}
          stats={
            data
              ? [
                  `${data.currency} ${data.totalBalance.toLocaleString()} due`,
                  `${data.rules.length} fee${data.rules.length === 1 ? '' : 's'}`,
                ]
              : undefined
          }
        />

        <HubCard
          icon={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }}
          title="Payment History"
          description="Every payment recorded against your account, most recent first."
          href={'/fees/payment-history' as Href}
          stats={paymentCount != null ? [`${paymentCount} payments`] : undefined}
        />
      </ScrollView>
    </AppScreen>
  );
}
