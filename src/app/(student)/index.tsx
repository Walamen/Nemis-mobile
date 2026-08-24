import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import { useGetAssessmentGradesQuery } from '@/api/grades/grades-api';
import { useGetAnnouncementsQuery } from '@/api/messages/messages-api';
import { useGetStudentDashboardQuery } from '@/api/student/dashboard-api';
import { Card } from '@/components/common/card';
import { GradeCard } from '@/components/cards/grade-card';
import { QuickActionCard } from '@/components/cards/quick-action-card';
import { StatCard } from '@/components/cards/stat-card';
import { HeroBanner } from '@/components/common/hero-banner';
import { Icon, type IconProps } from '@/components/common/icon';
import { QueryState } from '@/components/common/query-state';
import { SectionState } from '@/components/common/section-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { SectionHeader } from '@/components/layout/section-header';
import { CardBackgroundColor, Palette } from '@/theme';

const CHEVRON_ICON: IconProps['name'] = {
  ios: 'chevron.right',
  android: 'chevron_right',
  web: 'chevron_right',
};

// Shared surface color for every card on this screen (Quick Stats, Quick
// Actions, My record, Announcements, Recent Grades, the alert banner) — the
// same `CardBackgroundColor` every other Student card uses.
const STAT_BACKGROUND_COLOR = CardBackgroundColor;

// Home — matches the "NEMIS Mobile" Claude Design case study's shared Home
// template (Quick Stats · alert · Quick Actions · Announcements · Recent
// Grades), adapted to what's actually real here: no campus photo/term label
// (neither is real data), no fabricated "Upcoming Events" (no events/
// calendar feature exists in NEMIS), Quick Actions point at the app's real
// routes. See docs/PRODUCT_DECISIONS.md.
const QUICK_ACTIONS: {
  label: string;
  href: Href;
  icon: IconProps['name'];
  bg: string;
  tint: string;
}[] = [
  {
    label: 'Attendance',
    href: '/learning/attendance' as Href,
    icon: { ios: 'checkmark.circle', android: 'event_available', web: 'event_available' },
    bg: STAT_BACKGROUND_COLOR,
    tint: '#1B8A4C',
  },
  {
    label: 'Grades',
    href: '/learning/grades' as Href,
    icon: { ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' },
    bg: STAT_BACKGROUND_COLOR,
    tint: '#121894',
  },
  {
    label: 'Fees',
    href: '/fees/balance' as Href,
    icon: { ios: 'creditcard', android: 'credit_card', web: 'credit_card' },
    bg: STAT_BACKGROUND_COLOR,
    tint: '#6E3BD6',
  },
  {
    label: 'Assignments',
    href: '/tasks/assignments' as Href,
    icon: { ios: 'checklist', android: 'checklist', web: 'checklist' },
    bg: STAT_BACKGROUND_COLOR,
    tint: '#C22B54',
  },
  {
    label: 'Inbox',
    href: '/communication' as Href,
    icon: { ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' },
    bg: STAT_BACKGROUND_COLOR,
    tint: '#0E7C86',
  },
  {
    label: 'Schedule',
    href: '/learning/timetable' as Href,
    icon: { ios: 'clock', android: 'schedule', web: 'schedule' },
    bg: STAT_BACKGROUND_COLOR,
    tint: '#B5690A',
  },
];

// `warning` reads as `Palette.error` (red), not `Palette.warning` (amber) —
// the student dashboard's alert feed has no separate "error" severity, and
// a student-facing warning (e.g. an attendance issue) should read as
// urgent, not merely cautionary.
const ALERT_BORDER_COLOR = { warning: Palette.error, success: Palette.success } as const;

export default function OverviewScreen() {
  const router = useRouter();
  const theme = useTheme();
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
    data: announcements,
    isLoading: isAnnouncementsLoading,
    isError: isAnnouncementsError,
  } = useGetAnnouncementsQuery();
  // Same endpoint `/fees/balance` reads — real currency + balance for "My
  // record" below, and doubles as a cache-warm for that screen.
  const { data: feeStatus } = useGetFeeRulesStatusQuery();

  const recentGrades = [...(grades ?? [])]
    .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())
    .slice(0, 3);
  const topAnnouncements = announcements?.slice(0, 3);
  // NEMIS has no standalone "my class" field on the student's profile or
  // dashboard summary — `className` only ever comes back on assessment
  // grade records, so this is the earliest real source available (already
  // fetched for Recent Grades below, not a second request). Omitted
  // entirely if no grades have been published yet — see `DashboardHeader`.
  const studentClass = grades?.find((grade) => grade.className)?.className;

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '';
  const recordSubtitle = [studentClass, user?.institution?.name].filter(Boolean).join(' · ');
  const recordStats = [
    dashboard?.attendanceRate != null ? `Attendance ${dashboard.attendanceRate}%` : null,
    feeStatus ? `${feeStatus.currency} ${feeStatus.totalBalance.toLocaleString()} due` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <SafeAreaView style={styles.flex} edges={['left', 'right']}>
      {/* Fixed — sits outside the ScrollView so it stays in place while the
          rest of the screen scrolls underneath it. */}
      <DashboardHeader
        greeting={`Hello, ${user?.firstName}`}
        subtitle={studentClass}
        unreadCount={dashboard?.unreadMessages}
        notificationsHref={'/communication/notifications' as Href}
        avatarUrl={user?.profileImageUrl}
        avatarInitial={user?.firstName?.charAt(0)}
        avatarHref={'/settings/profile' as Href}
      />

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
          <View style={styles.body}>
            {user?.institution && (
              <HeroBanner
                title={user.institution.name}
                subtitle={user.institution.address}
                className="mt-4"
              />
            )}

            <SectionHeader title="Quick Stats" />
            <View style={styles.statRow}>
              {dashboard?.currentGPA != null && (
                <StatCard
                  label="GPA"
                  value={dashboard.currentGPA.toFixed(2)}
                  backgroundColor={STAT_BACKGROUND_COLOR}
                />
              )}
              <StatCard
                label="Attendance"
                value={`${dashboard?.attendanceRate ?? 0}%`}
                backgroundColor={STAT_BACKGROUND_COLOR}
              />
              <StatCard
                label="Unread"
                value={`${dashboard?.unreadMessages ?? 0}`}
                backgroundColor={STAT_BACKGROUND_COLOR}
              />
            </View>

            {dashboard?.alerts?.map((alert) => (
              <ThemedView
                key={alert.title}
                style={[
                  styles.alert,
                  {
                    backgroundColor: STAT_BACKGROUND_COLOR,
                    borderLeftColor: ALERT_BORDER_COLOR[alert.type],
                  },
                ]}
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

            {user && (
              <>
                <SectionHeader title="My record" href={'/settings/profile' as Href} />
                <Card
                  onPress={() => router.push('/settings/profile' as Href)}
                  backgroundColor={STAT_BACKGROUND_COLOR}
                  className="flex-row items-center"
                >
                  <View
                    style={[styles.recordAvatar, { backgroundColor: theme.backgroundSelected }]}
                  >
                    {user.profileImageUrl ? (
                      <Image
                        source={{ uri: user.profileImageUrl }}
                        style={styles.recordAvatarImage}
                        contentFit="cover"
                      />
                    ) : (
                      <ThemedText type="smallBold" style={{ color: Palette.secondary }}>
                        {initials}
                      </ThemedText>
                    )}
                  </View>
                  <View className="flex-1 gap-0.5">
                    <ThemedText type="smallBold">{fullName}</ThemedText>
                    {!!recordSubtitle && (
                      <ThemedText type="small" themeColor="textSecondary">
                        {recordSubtitle}
                      </ThemedText>
                    )}
                    {!!recordStats && (
                      <ThemedText type="small" themeColor="textSecondary">
                        {recordStats}
                      </ThemedText>
                    )}
                  </View>
                  <Icon name={CHEVRON_ICON} size="sm" color={theme.textSecondary} />
                </Card>
              </>
            )}

            <SectionHeader title="Announcements" />
            <SectionState
              isLoading={isAnnouncementsLoading}
              isError={isAnnouncementsError}
              isEmpty={!topAnnouncements?.length}
              emptyMessage="No announcements yet."
            >
              <ThemedView
                style={{ backgroundColor: STAT_BACKGROUND_COLOR }}
                className="gap-3 rounded-card p-4"
              >
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
                    backgroundColor={STAT_BACKGROUND_COLOR}
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
    paddingTop: 0,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  alert: {
    marginTop: 12,
    gap: 4,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recordAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  recordAvatarImage: {
    width: '100%',
    height: '100%',
  },
  gap1: {
    gap: 2,
  },
});
