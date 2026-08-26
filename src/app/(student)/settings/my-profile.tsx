import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';

import { useGetAssessmentGradesQuery } from '@/api/grades/grades-api';
import { useGetProfileQuery } from '@/api/profile/profile-api';
import { useGetStudentDashboardQuery } from '@/api/student/dashboard-api';
import { StatCard } from '@/components/cards/stat-card';
import { Badge } from '@/components/common/badge';
import { MenuList } from '@/components/common/menu-list';
import { QueryState } from '@/components/common/query-state';
import { AppHeader, type AppHeaderAction } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { ThemedText } from '@/components/typography/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { CardBackgroundColor, Palette } from '@/theme';
import { View } from '@/tw';

const EDIT_ICON: AppHeaderAction['icon'] = { ios: 'pencil', android: 'edit', web: 'edit' };
const WHITE = '#FFFFFF';
// Fixed light divider between "Student record" rows — the card's own
// background is the same fixed `CardBackgroundColor`, not theme-adaptive,
// so the divider shouldn't be either (a themed dark-mode divider would
// vanish or clash against a card that's deliberately always light gray).
const RECORD_DIVIDER_COLOR = '#E0E1E6';

/**
 * Read-only "My profile" summary — reached from the student Menu sheet's
 * "Profile" item and Home's avatar/"My record" card (see `(student)/_layout.tsx`
 * and `(student)/index.tsx`). Editing account details stays a separate step
 * (the pencil action here, and Settings' own "Profile" row) at
 * `/settings/profile`, which keeps its existing `EditProfileForm`.
 *
 * Mirrors the design's layout (dark header card, "Student record" list,
 * "This term at a glance" stats, Settings link) but only ever renders
 * fields NEMIS actually returns today. The design reference also included
 * NEMIS ID, date of birth, county, guardian, "enrolled since", an overall
 * term average, and class position/rank — none of those exist on any
 * current endpoint (see `docs/API_MAPPING.md`), so the "Student record"
 * list only has the two rows that are real, rather than faking the rest.
 * Grade/class and GPA/attendance are sourced exactly the way Home's "My
 * record" card already does (same queries, same fallback reasoning) to
 * stay consistent and share its cache.
 */
export default function MyProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    isError: isDashboardError,
    refetch: refetchDashboard,
  } = useGetStudentDashboardQuery();
  const { data: grades } = useGetAssessmentGradesQuery();
  // Only used for `isActive` (→ the "Enrolled" badge) — everything else on
  // this screen already comes from `useAuth`/the dashboard/grades queries.
  const { data: profile } = useGetProfileQuery();

  // NEMIS has no standalone "my class" field on the profile/dashboard
  // summary — `className` only ever comes back on assessment grade
  // records. Same reasoning as `(student)/index.tsx`'s `studentClass`.
  const studentClass = grades?.find((grade) => grade.className)?.className;
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '';
  const subtitle = [studentClass, user?.institution?.name].filter(Boolean).join(' · ');
  const hasTermStats = dashboard?.currentGPA != null || dashboard?.attendanceRate != null;

  // Same fields the header subtitle above already summarizes, laid out as
  // the design's "Student record" list — the design also has NEMIS ID,
  // date of birth, county, guardian and "enrolled since" rows here, but
  // none of those exist on any current endpoint (see docs/API_MAPPING.md),
  // so only the two real fields are shown.
  const record = [
    studentClass ? { label: 'Grade / class', value: studentClass } : null,
    user?.institution?.name ? { label: 'School', value: user.institution.name } : null,
  ].filter((row): row is { label: string; value: string } => row != null);

  return (
    <AppScreen contentClassName="" refreshing={isDashboardFetching} onRefresh={refetchDashboard}>
      <AppHeader
        title="My profile"
        actions={[
          {
            icon: EDIT_ICON,
            onPress: () => router.push('/settings/profile' as Href),
            accessibilityLabel: 'Edit profile',
          },
        ]}
      />

      <View className="flex-1 px-4 pt-2">
        <QueryState
          isLoading={isDashboardLoading}
          isError={isDashboardError}
          onRetry={refetchDashboard}
        >
          <View
            className="flex-row items-center gap-4 rounded-card p-5"
            style={{ backgroundColor: Palette.primary }}
          >
            <View
              className="items-center justify-center overflow-hidden rounded-full"
              style={{ width: 64, height: 64, backgroundColor: Palette.secondary }}
            >
              {user?.profileImageUrl ? (
                <Image
                  source={{ uri: user.profileImageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <ThemedText style={{ color: WHITE, fontSize: 22, fontWeight: '900' }}>
                  {initials}
                </ThemedText>
              )}
            </View>
            <View className="flex-1 gap-1">
              <ThemedText type="sectionHeading" style={{ color: WHITE }} numberOfLines={1}>
                {fullName}
              </ThemedText>
              {!!subtitle && (
                <ThemedText type="small" style={{ color: Palette.secondary100 }}>
                  {subtitle}
                </ThemedText>
              )}
              {/* `isActive` is an account-status flag, not a NEMIS enrollment
                  record — the closest real signal available for this badge. */}
              {profile?.isActive && <Badge label="Enrolled" tone="success" className="mt-1" />}
            </View>
          </View>

          {record.length > 0 && (
            <>
              <SectionHeader title="Student record" />
              <View
                className="overflow-hidden rounded-card"
                style={{ backgroundColor: CardBackgroundColor }}
              >
                {record.map((row, index) => (
                  <View
                    key={row.label}
                    className="flex-row items-center justify-between gap-3 px-4 py-3.5"
                    style={
                      index < record.length - 1
                        ? { borderBottomWidth: 1, borderBottomColor: RECORD_DIVIDER_COLOR }
                        : undefined
                    }
                  >
                    <ThemedText type="small" themeColor="textSecondary">
                      {row.label}
                    </ThemedText>
                    <ThemedText type="smallBold">{row.value}</ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}

          {hasTermStats && (
            <>
              <SectionHeader title="This term at a glance" />
              <View className="flex-row gap-3">
                {dashboard?.currentGPA != null && (
                  <StatCard
                    label="GPA"
                    value={dashboard.currentGPA.toFixed(2)}
                    backgroundColor={CardBackgroundColor}
                  />
                )}
                {dashboard?.attendanceRate != null && (
                  <StatCard
                    label="Attendance"
                    value={`${dashboard.attendanceRate}%`}
                    backgroundColor={CardBackgroundColor}
                  />
                )}
              </View>
            </>
          )}

          <View className="mt-5 gap-2">
            <MenuList
              items={[{ label: 'Settings', href: '/settings' as Href }]}
              backgroundColor={CardBackgroundColor}
            />
          </View>
        </QueryState>
      </View>
    </AppScreen>
  );
}
