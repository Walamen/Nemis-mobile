import { Image } from 'expo-image';
import type { Href } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMyAttendanceQuery } from '@/api/attendance/attendance-api';
import { useGetAssessmentGradesQuery } from '@/api/grades/grades-api';
import { useGetAnnouncementsQuery } from '@/api/messages/messages-api';
import { useGetStudentDashboardQuery } from '@/api/student/dashboard-api';
import { Icon, type IconProps } from '@/components/common/icon';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { Palette } from '@/theme';
import { Link } from '@/tw';

// Content sections mirror the web student dashboard (stat tiles, quick
// actions, recent grades, attendance summary, recent activity); visual
// style (gradient header, colorful quick-action cards) follows the app
// mockup, kept in the app's own blue brand rather than its literal colors.
const QUICK_ACTIONS: {
  label: string;
  href: Href;
  icon: IconProps['name'];
  bg: string;
  tint: string;
}[] = [
  {
    label: 'Grades',
    href: '/learning/grades' as Href,
    icon: { ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' },
    bg: '#EAF2FF',
    tint: '#0367A0',
  },
  {
    label: 'Attendance',
    href: '/learning/attendance' as Href,
    icon: { ios: 'checkmark.circle', android: 'event_available', web: 'event_available' },
    bg: '#E8F9EF',
    tint: '#1B8A4C',
  },
  {
    label: 'Subjects',
    href: '/learning/subjects' as Href,
    icon: { ios: 'book', android: 'menu_book', web: 'menu_book' },
    bg: '#FFF4E5',
    tint: '#B5690A',
  },
  {
    label: 'Timetable',
    href: '/learning/timetable' as Href,
    icon: { ios: 'clock', android: 'schedule', web: 'schedule' },
    bg: '#F3ECFF',
    tint: '#6E3BD6',
  },
  {
    label: 'Assignments',
    href: '/tasks/assignments' as Href,
    icon: { ios: 'checklist', android: 'checklist', web: 'checklist' },
    bg: '#FDEBEF',
    tint: '#C22B54',
  },
  {
    label: 'Messages',
    href: '/communication/messages' as Href,
    icon: { ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' },
    bg: '#E6F7F7',
    tint: '#0E7C86',
  },
];

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

function SectionHeader({ title }: { title: string }) {
  return (
    <ThemedText type="sectionHeading" className="mb-2 mt-5">
      {title}
    </ThemedText>
  );
}

function QuickActionCard({ label, href, icon, bg, tint }: (typeof QUICK_ACTIONS)[number]) {
  return (
    <Link href={href} style={[styles.quickAction, { backgroundColor: bg }]}>
      <View style={[styles.quickActionIcon, { backgroundColor: '#FFFFFF' }]}>
        <Icon name={icon} size="md" color={tint} />
      </View>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Link>
  );
}

/** Small inline loading/error/empty renderer for compact card sections, where
 * QueryState's `flex-1` states would collapse to zero height (they're only
 * safe inside a screen-filling container, not a normal ScrollView flow). */
function SectionState({
  isLoading,
  isError,
  isEmpty,
  emptyMessage,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <ThemedView type="backgroundElement" className="items-center rounded-card p-6">
        <ActivityIndicator />
      </ThemedView>
    );
  }
  if (isError) {
    return (
      <ThemedView type="backgroundElement" className="rounded-card p-6">
        <ThemedText themeColor="textSecondary" className="text-center">
          Couldn&apos;t load this right now.
        </ThemedText>
      </ThemedView>
    );
  }
  if (isEmpty) {
    return (
      <ThemedView type="backgroundElement" className="items-center gap-1 rounded-card p-6">
        <ThemedText themeColor="textSecondary" className="text-center">
          {emptyMessage}
        </ThemedText>
      </ThemedView>
    );
  }
  return <>{children}</>;
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
    data: grades,
    isLoading: isGradesLoading,
    isError: isGradesError,
  } = useGetAssessmentGradesQuery();
  const {
    data: attendance,
    isLoading: isAttendanceLoading,
    isError: isAttendanceError,
  } = useGetMyAttendanceQuery();
  const {
    data: announcements,
    isLoading: isAnnouncementsLoading,
    isError: isAnnouncementsError,
  } = useGetAnnouncementsQuery();

  const recentGrades = [...(grades ?? [])]
    .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())
    .slice(0, 3);
  const recentActivity = announcements?.slice(0, 3);
  const topSubjects = attendance?.subjects?.slice(0, 3);

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
      <QueryState
        isLoading={isDashboardLoading}
        isError={isDashboardError}
        onRetry={refetchDashboard}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isDashboardFetching} onRefresh={refetchDashboard} />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.flex}>
                <ThemedText type="title" style={styles.headerGreeting}>
                  Hello, {user?.firstName} 👋
                </ThemedText>
                <ThemedText style={styles.headerSubtitle}>Have a great day ahead!</ThemedText>
              </View>

              <View style={styles.headerActions}>
                <Link href={'/communication/notifications' as Href} style={styles.headerIconButton}>
                  <Icon
                    name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
                    color="#FFFFFF"
                  />
                  {!!dashboard?.unreadMessages && (
                    <View style={styles.headerBadge}>
                      <ThemedText style={styles.headerBadgeText}>
                        {dashboard.unreadMessages}
                      </ThemedText>
                    </View>
                  )}
                </Link>

                <Link href={'/settings' as Href} style={styles.headerAvatar}>
                  {user?.profileImageUrl ? (
                    <Image
                      source={{ uri: user.profileImageUrl }}
                      style={styles.headerAvatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <ThemedText style={styles.headerAvatarInitial}>
                      {user?.firstName?.charAt(0)}
                    </ThemedText>
                  )}
                </Link>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.statRow}>
              <StatCard label="Attendance Rate" value={`${dashboard?.attendanceRate ?? 0}%`} />
              <StatCard label="Present Days" value={`${dashboard?.presentDays ?? 0}`} />
              <StatCard label="Unread Messages" value={`${dashboard?.unreadMessages ?? 0}`} />
            </View>

            {dashboard?.alerts?.map((alert) => (
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
            <View style={styles.quickGrid}>
              {QUICK_ACTIONS.map((action) => (
                <QuickActionCard key={action.label} {...action} />
              ))}
            </View>

            <SectionHeader title="Recent Grades" />
            <SectionState
              isLoading={isGradesLoading}
              isError={isGradesError}
              isEmpty={recentGrades.length === 0}
              emptyMessage="Grades will appear here once published."
            >
              <ThemedView type="backgroundElement" className="gap-3 rounded-card p-4">
                {recentGrades.map((grade) => (
                  <View key={grade.id} style={styles.listRow}>
                    <View style={styles.flex}>
                      <ThemedText type="smallBold">{grade.subjectName}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {grade.assessmentName}
                      </ThemedText>
                    </View>
                    <ThemedText type="smallBold">
                      {grade.percentage}% ({grade.letterGrade})
                    </ThemedText>
                  </View>
                ))}
              </ThemedView>
            </SectionState>

            <SectionHeader title="Attendance Summary" />
            <SectionState
              isLoading={isAttendanceLoading}
              isError={isAttendanceError}
              emptyMessage="No attendance recorded yet."
            >
              <ThemedView type="backgroundElement" className="gap-3 rounded-card p-4">
                <View style={styles.listRow}>
                  <ThemedText type="subtitle" className="text-2xl">
                    {attendance?.summary.percentage ?? 0}%
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {attendance?.summary.present ?? 0} present · {attendance?.summary.absent ?? 0}{' '}
                    absent · {attendance?.summary.late ?? 0} late
                  </ThemedText>
                </View>
                {topSubjects?.map((subject) => (
                  <View key={subject.subjectId} style={styles.listRow}>
                    <ThemedText type="small">{subject.subjectName}</ThemedText>
                    <ThemedText type="smallBold">{subject.summary.percentage}%</ThemedText>
                  </View>
                ))}
              </ThemedView>
            </SectionState>

            <SectionHeader title="Recent Activity" />
            <SectionState
              isLoading={isAnnouncementsLoading}
              isError={isAnnouncementsError}
              isEmpty={!recentActivity?.length}
              emptyMessage="No recent activity yet."
            >
              <ThemedView type="backgroundElement" className="gap-3 rounded-card p-4">
                {recentActivity?.map((item) => (
                  <View key={item.id} style={styles.gap1}>
                    <ThemedText type="smallBold">{item.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.content}
                    </ThemedText>
                  </View>
                ))}
              </ThemedView>
            </SectionState>
          </View>
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: Palette.secondary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGreeting: {
    color: '#FFFFFF',
  },
  headerSubtitle: {
    color: '#E6F4FA',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#C10021',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  headerAvatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 16,
    marginTop: -16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '31%',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  gap1: {
    gap: 2,
  },
});
