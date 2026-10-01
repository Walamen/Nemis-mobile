import { Image } from 'expo-image';
import type { Href } from 'expo-router';

import { useGetProfileQuery } from '@/api/profile/profile-api';
import { useGetStudentDashboardQuery } from '@/api/student/dashboard-api';
import { useGetMyStudentProfileQuery } from '@/api/student/student-profile-api';
import { StatCard } from '@/components/cards/stat-card';
import { Badge } from '@/components/common/badge';
import { MenuList } from '@/components/common/menu-list';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { SkeletonProfile } from '@/components/loading/skeleton-profile';
import { ThemedText } from '@/components/typography/themed-text';
import { useCurrentTermResult } from '@/hooks/use-current-term-result';
import { useStudentIdentity } from '@/hooks/use-student-identity';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { View } from '@/tw';
import { buildStudentRecord } from '@/utils/student-record';

const WHITE = '#FFFFFF';

/**
 * "My profile" — the student's NEMIS record, matching the design: navy
 * identity card, "Student record" list, "This term at a glance", Settings.
 * Reached from the Menu sheet's "Profile" item and Home's avatar/"My record"
 * card. Editing account details is Settings → Profile (`EditProfileForm`).
 *
 * Every value is real: the record comes from `GET /student/profile/me`,
 * attendance from the dashboard, the average from the current published
 * term. The design's County, Enrolled since and Position aren't returned by
 * any endpoint, so they're left out rather than faked (see
 * docs/PRODUCT_DECISIONS.md).
 */
export default function MyProfileScreen() {
  const theme = useTheme();
  const { user, fullName, initials, studentClass, schoolName, classAndSchool } =
    useStudentIdentity();
  const studentProfileQuery = useGetMyStudentProfileQuery();
  const dashboardQuery = useGetStudentDashboardQuery();
  const currentTerm = useCurrentTermResult();
  // Only used for `isActive` (→ the "Enrolled" badge).
  const { data: account } = useGetProfileQuery();

  const record = buildStudentRecord(studentProfileQuery.data, {
    className: studentClass,
    schoolName,
  });
  const attendanceRate = dashboardQuery.data?.attendanceRate;
  const termAverage = currentTerm.average;
  const hasTermStats = attendanceRate != null || termAverage != null;

  const isRefreshing =
    studentProfileQuery.isFetching || dashboardQuery.isFetching || currentTerm.isFetching;
  function refreshAll() {
    studentProfileQuery.refetch();
    dashboardQuery.refetch();
    currentTerm.refetch();
  }

  return (
    <AppScreen contentClassName="" refreshing={isRefreshing} onRefresh={refreshAll}>
      <AppHeader title="My profile" titleAlign="left" />

      <View className="flex-1 px-4 pt-2">
        <QueryState
          isLoading={studentProfileQuery.isLoading}
          // A failed refresh keeps showing the record already loaded.
          isError={studentProfileQuery.isError && !studentProfileQuery.data}
          error={studentProfileQuery.error}
          onRetry={studentProfileQuery.refetch}
          loadingFallback={<SkeletonProfile fields={5} />}
        >
          <View
            className="flex-row items-center gap-4 rounded-card p-5"
            style={{ backgroundColor: Palette.primary }}
            accessible
            accessibilityLabel={[fullName, classAndSchool, account?.isActive ? 'Enrolled' : '']
              .filter(Boolean)
              .join(', ')}
          >
            <View
              className="items-center justify-center overflow-hidden rounded-full"
              style={{ width: 64, height: 64, backgroundColor: Palette.accent }}
            >
              {user?.profileImageUrl ? (
                <Image
                  source={{ uri: user.profileImageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <ThemedText style={{ color: WHITE, fontSize: 22, fontWeight: '700' }}>
                  {initials}
                </ThemedText>
              )}
            </View>
            <View className="flex-1 gap-1">
              <ThemedText type="sectionHeading" style={{ color: WHITE }} numberOfLines={1}>
                {fullName}
              </ThemedText>
              {!!classAndSchool && (
                <ThemedText type="small" style={{ color: Palette.secondary100 }}>
                  {classAndSchool}
                </ThemedText>
              )}
              {/* `isActive` is an account-status flag, not a NEMIS enrollment
                  record — the closest real signal available for this badge. */}
              {account?.isActive && <Badge label="Enrolled" tone="success" className="mt-1" />}
            </View>
          </View>

          {record.length > 0 && (
            <>
              <SectionHeader title="Student record" />
              <View
                className="overflow-hidden rounded-card"
                style={{ backgroundColor: theme.card }}
              >
                {record.map((row, index) => (
                  <View
                    key={row.label}
                    className="flex-row items-center justify-between gap-3 px-4 py-3.5"
                    style={
                      index < record.length - 1
                        ? { borderBottomWidth: 1, borderBottomColor: theme.border }
                        : undefined
                    }
                    accessible
                    accessibilityLabel={`${row.label}: ${row.value}`}
                  >
                    <ThemedText type="small" themeColor="textSecondary">
                      {row.label}
                    </ThemedText>
                    {/* `flex-1` lets a long value (e.g. a long school name)
                        wrap instead of overflowing the row. */}
                    <ThemedText type="smallBold" className="flex-1 text-right">
                      {row.value}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}

          {hasTermStats && (
            <>
              <SectionHeader title="This term at a glance" />
              <View className="flex-row gap-3">
                {attendanceRate != null && (
                  <StatCard
                    label="Attendance"
                    value={`${attendanceRate}%`}
                    backgroundColor={theme.card}
                  />
                )}
                {termAverage != null && (
                  <StatCard
                    label="Average"
                    value={`${termAverage.toFixed(1)}%`}
                    backgroundColor={theme.card}
                  />
                )}
              </View>
            </>
          )}

          <View className="mb-6 mt-5 gap-2">
            <MenuList
              items={[{ label: 'Settings', href: '/settings' as Href }]}
              backgroundColor={theme.card}
            />
          </View>
        </QueryState>
      </View>
    </AppScreen>
  );
}
