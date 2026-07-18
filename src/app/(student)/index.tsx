import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetAnnouncementsQuery } from '@/api/messages/messages-api';
import { useGetStudentDashboardQuery } from '@/api/student/dashboard-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { ScrollView } from '@/tw';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundElement" className="flex-1 gap-1 rounded-card p-4">
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="subtitle" className="text-2xl">
        {value}
      </ThemedText>
    </ThemedView>
  );
}

export default function OverviewScreen() {
  const { user } = useAuth();
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    isError: isDashboardError,
    refetch: refetchDashboard,
  } = useGetStudentDashboardQuery();
  const {
    data: announcements,
    isLoading: isAnnouncementsLoading,
    isError: isAnnouncementsError,
  } = useGetAnnouncementsQuery();

  return (
    <SafeAreaView className="flex-1">
      <QueryState
        isLoading={isDashboardLoading}
        isError={isDashboardError}
        onRetry={refetchDashboard}
      >
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={
            <RefreshControl refreshing={isDashboardFetching} onRefresh={refetchDashboard} />
          }
        >
          <ThemedText type="title" className="mb-4">
            Welcome, {user?.firstName}
          </ThemedText>

          <ThemedView className="mb-4 flex-row gap-3">
            <StatCard label="Attendance" value={`${dashboard?.attendanceRate ?? 0}%`} />
            <StatCard label="GPA" value={dashboard?.currentGPA?.toFixed(2) ?? '—'} />
            <StatCard label="Pending Fees" value={`${dashboard?.pendingFees ?? 0}`} />
          </ThemedView>

          {dashboard?.alerts.map((alert) => (
            <ThemedView
              key={alert.title}
              type="backgroundElement"
              className="mb-2 gap-1 rounded-card p-4"
            >
              <ThemedText type="smallBold">{alert.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {alert.message}
              </ThemedText>
            </ThemedView>
          ))}

          <ThemedText type="sectionHeading" className="mb-2 mt-2">
            Recent Announcements
          </ThemedText>

          <QueryState
            isLoading={isAnnouncementsLoading}
            isError={isAnnouncementsError}
            isEmpty={announcements?.length === 0}
            emptyMessage="No announcements yet."
          >
            {announcements?.slice(0, 5).map((announcement) => (
              <ThemedView
                key={announcement.id}
                type="backgroundElement"
                className="mb-2 gap-1 rounded-card p-4"
              >
                <ThemedText type="smallBold">{announcement.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {announcement.content}
                </ThemedText>
              </ThemedView>
            ))}
          </QueryState>
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
