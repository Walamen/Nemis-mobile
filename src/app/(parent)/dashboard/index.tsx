import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';

import { useGetParentDashboardQuery } from '@/api/parent/dashboard-api';
import { QuickActionCard } from '@/components/cards/quick-action-card';
import { StatCard } from '@/components/cards/stat-card';
import { Card } from '@/components/common/card';
import { ChildSwitcher } from '@/components/common/child-switcher';
import type { IconProps } from '@/components/common/icon';
import { QueryState } from '@/components/common/query-state';
import { AppScreen } from '@/components/layout/app-screen';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { SectionHeader } from '@/components/layout/section-header';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useSelectedChild } from '@/hooks/use-selected-child';

// Icons/colors are reused from the student dashboard's Quick Actions palette
// (same "in-brand pastel tiles" set — see docs/UI_PATTERNS.md §10) rather
// than inventing new ones, so the two dashboards feel like one system.
const QUICK_ACTIONS: {
  label: string;
  href: Href;
  icon: IconProps['name'];
  bg: string;
  tint: string;
}[] = [
  {
    label: 'My Child',
    href: '/dashboard/my-child' as Href,
    icon: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
    bg: '#F3ECFF',
    tint: '#6E3BD6',
  },
  {
    label: 'Pay Fees',
    href: '/finance' as Href,
    icon: { ios: 'creditcard', android: 'credit_card', web: 'credit_card' },
    bg: '#EAF2FF',
    tint: '#0367A0',
  },
  {
    label: 'Attendance',
    href: '/academics/attendance' as Href,
    icon: { ios: 'checkmark.circle', android: 'event_available', web: 'event_available' },
    bg: '#E8F9EF',
    tint: '#1B8A4C',
  },
  {
    label: 'Contact School',
    href: '/communication/messages' as Href,
    icon: { ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' },
    bg: '#E6F7F7',
    tint: '#0E7C86',
  },
];

export default function ParentDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, isLoading, isFetching, isError, refetch } = useGetParentDashboardQuery();
  const { selectedChild } = useSelectedChild();

  return (
    <AppScreen scroll={false} contentClassName="">
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <DashboardHeader
            greeting={`Hello, ${user?.firstName} 👋`}
            subtitle={`${data?.stats.totalChildren ?? 0} ${
              data?.stats.totalChildren === 1 ? 'child' : 'children'
            } linked`}
            unreadCount={data?.stats.unreadMessages}
            notificationsHref={'/communication/notifications' as Href}
            avatarUrl={user?.profileImageUrl}
            avatarInitial={user?.firstName?.charAt(0)}
            avatarHref={'/profile' as Href}
          />

          <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
            <SectionHeader title="Quick Stats" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <StatCard
                label="Outstanding Fees"
                value={`LRD ${(data?.stats.outstandingFees ?? 0).toLocaleString()}`}
              />
              <StatCard label="Assignments Due" value={`${data?.stats.assignmentsDue ?? 0}`} />
              <StatCard label="Unread Messages" value={`${data?.stats.unreadMessages ?? 0}`} />
            </View>

            {data?.alerts?.map((alert) => (
              <ThemedView
                key={alert.title}
                type="backgroundElement"
                className="mt-3 gap-1 rounded-card p-4"
              >
                <ThemedText type="smallBold">{alert.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {alert.message}
                </ThemedText>
              </ThemedView>
            ))}

            <SectionHeader title="Quick Actions" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {QUICK_ACTIONS.map((action) => (
                <QuickActionCard key={action.label} {...action} />
              ))}
            </View>

            <SectionHeader title="Your Children" href={'/dashboard/my-child' as Href} />
            <ChildSwitcher />
            {selectedChild && (
              <Card onPress={() => router.push('/dashboard/my-child' as Href)}>
                <ThemedText type="smallBold">
                  {selectedChild.firstName} {selectedChild.lastName}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {selectedChild.grade} · {selectedChild.school}
                </ThemedText>
                <ThemedText type="small">
                  Attendance: {selectedChild.attendance}% · {selectedChild.feeLabel}
                </ThemedText>
              </Card>
            )}
          </View>
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
