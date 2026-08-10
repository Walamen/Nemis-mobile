import type { Href } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetParentDashboardQuery } from '@/api/parent/dashboard-api';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Link } from '@/tw';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const QUICK_ACTIONS: { label: string; href: Href }[] = [
  { label: 'View My Child', href: '/dashboard/my-child' as Href },
  { label: 'Pay Fees', href: '/finance' as Href },
  { label: 'View Attendance', href: '/academics/attendance' as Href },
  { label: 'Contact School', href: '/communication/messages' as Href },
];

export default function ParentDashboardScreen() {
  const { user } = useAuth();
  const { data, isLoading, isFetching, isError, refetch } = useGetParentDashboardQuery();
  const { selectedChild } = useSelectedChild();
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ThemedText type="title" className="mb-1">
            Welcome, {user?.firstName}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" className="mb-4">
            {data?.stats.totalChildren ?? 0}{' '}
            {data?.stats.totalChildren === 1 ? 'child' : 'children'} linked
          </ThemedText>

          <ThemedView className="mb-4 flex-row flex-wrap gap-2">
            <StatCard
              label="Outstanding fees"
              value={`LRD ${(data?.stats.outstandingFees ?? 0).toLocaleString()}`}
            />
            <StatCard label="Assignments due" value={String(data?.stats.assignmentsDue ?? 0)} />
            <StatCard label="Unread messages" value={String(data?.stats.unreadMessages ?? 0)} />
          </ThemedView>

          {data?.alerts && data.alerts.length > 0 && (
            <ThemedView className="mb-4 gap-2">
              <ThemedText type="sectionHeading">Alerts</ThemedText>
              {data.alerts.map((alert, index) => (
                <ThemedView key={index} type="backgroundElement" className="gap-1 rounded-card p-4">
                  <ThemedText type="smallBold">{alert.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {alert.message}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}

          <ThemedText type="sectionHeading" className="mb-2">
            Child summary
          </ThemedText>
          <ChildSwitcher />
          {selectedChild && (
            <Link
              href={'/dashboard/my-child' as Href}
              className="mb-4 gap-1 rounded-card p-4"
              style={{ backgroundColor: theme.backgroundElement }}
            >
              <ThemedText type="smallBold">
                {selectedChild.firstName} {selectedChild.lastName}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {selectedChild.grade} · {selectedChild.school}
              </ThemedText>
              <ThemedText type="small">
                Attendance: {selectedChild.attendance}% · {selectedChild.feeLabel}
              </ThemedText>
            </Link>
          )}

          <ThemedText type="sectionHeading" className="mb-2">
            Quick actions
          </ThemedText>
          <ThemedView className="mb-6 flex-row flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="min-w-[47%] flex-1 rounded-card p-4"
                style={{ backgroundColor: theme.backgroundElement }}
              >
                <ThemedText type="small">{action.label}</ThemedText>
              </Link>
            ))}
          </ThemedView>
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundElement" className="min-w-[30%] flex-1 gap-1 rounded-card p-4">
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </ThemedView>
  );
}
