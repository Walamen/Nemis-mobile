import type { Href } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMyAttendanceQuery } from '@/api/attendance/attendance-api';
import { useGetAssessmentGradesQuery } from '@/api/grades/grades-api';
import { useGetAnnouncementsQuery } from '@/api/messages/messages-api';
import { useGetStudentDashboardQuery } from '@/api/student/dashboard-api';
import { useGetAssignmentsQuery } from '@/api/tasks/assignments-api';
import { AssignmentCard } from '@/components/cards/assignment-card';
import { AttendanceCard } from '@/components/cards/attendance-card';
import { GradeCard } from '@/components/cards/grade-card';
import { QuickActionCard } from '@/components/cards/quick-action-card';
import { StatCard } from '@/components/cards/stat-card';
import { type IconProps } from '@/components/common/icon';
import { QueryState } from '@/components/common/query-state';
import { SectionState } from '@/components/common/section-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { SectionHeader } from '@/components/layout/section-header';

// Section order follows an explicit information hierarchy — each answers a
// question: Greeting (who am I) → Summary (GPA/fees) → Quick Stats (how am
// I doing) → alerts → Quick Actions (what can I do) → Announcements (what's
// new) → Recent Grades (how are my academics) → Attendance (am I attending)
// → Assignments (what needs attention — unsubmitted/late, soonest due
// first). No separate "Recent Activity" feed: the only real data source for
// that is the same Announcements query, so it isn't duplicated under a
// second heading — see docs/PRODUCT_DECISIONS.md. Visual style (gradient
// header, colorful quick-action cards) follows the app mockup, kept in the
// app's own blue brand rather than its literal colors.
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
  const {
    data: assignments,
    isLoading: isAssignmentsLoading,
    isError: isAssignmentsError,
  } = useGetAssignmentsQuery();

  const recentGrades = [...(grades ?? [])]
    .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())
    .slice(0, 3);
  const topAnnouncements = announcements?.slice(0, 3);
  const topSubjects = attendance?.subjects?.slice(0, 3);
  // "Needs attention" — not yet submitted (or submitted late), soonest due first.
  const dueAssignments = (assignments ?? [])
    .filter((a) => !a.mySubmission || a.mySubmission.status === 'LATE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

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
          <DashboardHeader
            greeting={`Hello, ${user?.firstName} 👋`}
            subtitle="Have a great day ahead!"
            unreadCount={dashboard?.unreadMessages}
            notificationsHref={'/communication/notifications' as Href}
            avatarUrl={user?.profileImageUrl}
            avatarInitial={user?.firstName?.charAt(0)}
            avatarHref={'/settings' as Href}
          />

          <View style={styles.body}>
            {/* GPA is optional (not every student has one yet, e.g. before any
                grades are posted) — only shown when the API actually returns
                one, never defaulted to 0 (that would misrepresent "no grade
                yet" as "zero GPA"). Fees Due is always a real number. */}
            <SectionHeader title="Summary" />
            <View style={styles.statRow}>
              {dashboard?.currentGPA != null && (
                <StatCard label="GPA" value={dashboard.currentGPA.toFixed(2)} />
              )}
              <StatCard
                label="Fees Due"
                value={`${(dashboard?.pendingFees ?? 0).toLocaleString()}`}
              />
            </View>

            <SectionHeader title="Quick Stats" />
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

            <SectionHeader title="Announcements" />
            <SectionState
              isLoading={isAnnouncementsLoading}
              isError={isAnnouncementsError}
              isEmpty={!topAnnouncements?.length}
              emptyMessage="No announcements yet."
            >
              <ThemedView type="backgroundElement" className="gap-3 rounded-card p-4">
                {topAnnouncements?.map((item) => (
                  <View key={item.id} style={styles.gap1}>
                    <ThemedText type="smallBold">{item.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.content}
                    </ThemedText>
                  </View>
                ))}
              </ThemedView>
            </SectionState>

            <SectionHeader title="Recent Grades" href={'/learning/grades' as Href} />
            <SectionState
              isLoading={isGradesLoading}
              isError={isGradesError}
              isEmpty={recentGrades.length === 0}
              emptyMessage="Grades will appear here once published."
            >
              <View className="gap-2">
                {recentGrades.map((grade) => (
                  <GradeCard
                    key={grade.id}
                    subjectName={grade.subjectName}
                    label={grade.assessmentName}
                    percentage={grade.percentage}
                    letterGrade={grade.letterGrade}
                  />
                ))}
              </View>
            </SectionState>

            <SectionHeader title="Attendance" href={'/learning/attendance' as Href} />
            <SectionState
              isLoading={isAttendanceLoading}
              isError={isAttendanceError}
              emptyMessage="No attendance recorded yet."
            >
              <AttendanceCard
                percentage={attendance?.summary.percentage ?? 0}
                present={attendance?.summary.present ?? 0}
                absent={attendance?.summary.absent ?? 0}
                late={attendance?.summary.late ?? 0}
                excused={attendance?.summary.excused}
                className="mb-2"
              />
              {topSubjects && topSubjects.length > 0 && (
                <ThemedView type="backgroundElement" className="gap-3 rounded-card p-4">
                  {topSubjects.map((subject) => (
                    <View key={subject.subjectId} style={styles.listRow}>
                      <ThemedText type="small">{subject.subjectName}</ThemedText>
                      <ThemedText type="smallBold">{subject.summary.percentage}%</ThemedText>
                    </View>
                  ))}
                </ThemedView>
              )}
            </SectionState>

            <SectionHeader title="Assignments" href={'/tasks/assignments' as Href} />
            <SectionState
              isLoading={isAssignmentsLoading}
              isError={isAssignmentsError}
              isEmpty={dueAssignments.length === 0}
              emptyMessage="You're all caught up!"
            >
              <View className="gap-2">
                {dueAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    title={assignment.title}
                    subjectLabel={assignment.subjectName ?? assignment.className}
                    dueDate={assignment.dueDate}
                    status={assignment.mySubmission?.status ?? 'PENDING'}
                  />
                ))}
              </View>
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
