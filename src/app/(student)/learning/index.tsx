import { Image } from 'expo-image';
import type { Href } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useGetMyAttendanceQuery } from '@/api/attendance/attendance-api';
import { useGetResultsQuery } from '@/api/grades/grades-api';
import { useGetSubjectsQuery } from '@/api/student/subjects-api';
import { useGetMyTimetableQuery } from '@/api/timetable/timetable-api';
import { HubCard } from '@/components/cards/hub-card';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { CardBackgroundColor, DisplayFontFamily, Palette, Radius } from '@/theme';
import type { TermResult } from '@/types/grades';
import { TIMETABLE_DAYS } from '@/types/timetable';

/** Real photo (students reading, uniform cutout on a transparent
 * background) standing in for the NEMIS Design reference's illustration —
 * that exact asset couldn't be pulled through the design MCP (over its
 * 256KB fetch cap), so this is the equivalent art the project already has
 * checked in. */
const HERO_IMAGE_SOURCE = require('@/assets/images/HeroImage.png');
const HERO_IMAGE_ASPECT_RATIO = 781 / 564;

/**
 * Term banner for the Academics hub — a solid navy card (not the shared
 * full-bleed photo `HeroBanner` Home uses; the NEMIS Design reference gives
 * Academics its own treatment: eyebrow term label + serif title + subtitle
 * over `Palette.primary`, with a photo bleeding off the bottom-right edge).
 * Kept local to this screen rather than promoted to `components/common` —
 * nothing else uses this shape yet; extract it if the Parent Academics
 * screen adopts the same design.
 */
function TermBanner({ term }: { term?: TermResult }) {
  return (
    <View style={termBannerStyles.container}>
      <View style={termBannerStyles.textColumn}>
        {term && (
          <ThemedText style={termBannerStyles.eyebrow}>
            {term.termName.toUpperCase()} · {term.academicYear}
          </ThemedText>
        )}
        <ThemedText style={termBannerStyles.title}>Your academic record</ThemedText>
        <ThemedText style={termBannerStyles.subtitle}>
          {term
            ? `Your records for ${term.termName} of the ${term.academicYear} school year.`
            : 'Subjects, schedule, grades, and attendance — all in one place.'}
        </ThemedText>
      </View>
      <Image
        source={HERO_IMAGE_SOURCE}
        style={termBannerStyles.heroImage}
        contentFit="contain"
        contentPosition="bottom right"
      />
    </View>
  );
}

const termBannerStyles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: Palette.primary,
    borderRadius: Radius.card,
    minHeight: 118,
    overflow: 'hidden',
  },
  textColumn: {
    justifyContent: 'center',
    gap: 6,
    // Right padding clears the photo bleeding in from that edge — sized to
    // the image's rendered width (~140px at the `heroImage` height below).
    paddingVertical: 18,
    paddingLeft: 18,
    paddingRight: 140,
    minHeight: 118,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Palette.secondary100,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: DisplayFontFamily,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Palette.secondary50,
  },
  heroImage: {
    position: 'absolute',
    right: -8,
    bottom: 0,
    height: 112,
    width: 112 * HERO_IMAGE_ASPECT_RATIO,
  },
});

/**
 * Academics hub — matches the "NEMIS Mobile" Claude Design reference's
 * descriptive-card hub shape (`HubCard`). Each row's stat pills are real,
 * already-fetched figures (not the mockup's placeholder counts) — the
 * queries here double as a cache-warm for the destination screens, which
 * read the same endpoints. See docs/PRODUCT_DECISIONS.md.
 *
 * Does NOT render its menu/content behind a `QueryState` gate — per
 * docs/UI_PATTERNS.md §6, section-landing/hub screens must render
 * immediately regardless of data state; each `HubCard`'s `stats` prop
 * resolves independently to `undefined` (and is simply omitted by
 * `HubCard`) until its own query settles, so a slow/failed endpoint
 * degrades one card's stat pills, never the whole screen.
 *
 * Uses the shared `AppScreen` shell directly — its root `SafeAreaView`
 * blank-screen defect (className="flex-1" silently not applying; see
 * app-screen.tsx) is now fixed centrally, confirmed on-device.
 */
export default function LearningMenuScreen() {
  const subjectsQuery = useGetSubjectsQuery();
  const timetableQuery = useGetMyTimetableQuery();
  const resultsQuery = useGetResultsQuery();
  const attendanceQuery = useGetMyAttendanceQuery();

  const { data: subjectsData } = subjectsQuery;
  const { data: timetable } = timetableQuery;
  const { data: terms } = resultsQuery;
  const { data: attendance } = attendanceQuery;

  const isFetching =
    subjectsQuery.isFetching ||
    timetableQuery.isFetching ||
    resultsQuery.isFetching ||
    attendanceQuery.isFetching;
  const refetch = () => {
    subjectsQuery.refetch();
    timetableQuery.refetch();
    resultsQuery.refetch();
    attendanceQuery.refetch();
  };

  const uniqueTeachers = subjectsData
    ? new Set(subjectsData.subjects.map((s) => s.teacher.id)).size
    : undefined;

  const scheduledDays = timetable
    ? TIMETABLE_DAYS.filter((day) => (timetable[day]?.length ?? 0) > 0)
    : undefined;
  const allEntries = timetable ? Object.values(timetable).flat() : undefined;

  const currentTerm = terms?.[terms.length - 1];
  const termAverage = currentTerm?.termAverages.length
    ? currentTerm.termAverages.reduce((sum, s) => sum + s.average, 0) /
      currentTerm.termAverages.length
    : undefined;

  return (
    // `AppScreen`'s defaults (`tabBarInset: false`, `edges` excluding
    // `bottom`) already do the right thing here — no override needed. Our
    // own `paddingBottom: 24` below is the real, sufficient breathing room
    // the design calls for.
    <AppScreen scroll={false} contentClassName="">
      {/* Tab root — no back destination, so force the back button off
          rather than relying on router.canGoBack()'s default. */}
      <AppHeader title="Academics" showBack={false} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
          gap: 16,
        }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <TermBanner term={currentTerm} />

        {/* Tighter 10px rhythm between the four hub rows themselves — the
            16px above only separates the banner from this group, matching
            the NEMIS Design reference's two-tier spacing. */}
        <View style={{ gap: 10 }}>
          <HubCard
            icon={{ ios: 'book', android: 'menu_book', web: 'menu_book' }}
            title="Subjects"
            description="The subjects registered this term, each with its teacher, weekly periods, and how you're doing."
            href={'/learning/subjects' as Href}
            backgroundColor={CardBackgroundColor}
            iconColor={Palette.accent}
            stats={
              subjectsData
                ? [
                    `${subjectsData.summary.totalSubjects} subjects`,
                    `${uniqueTeachers} teacher${uniqueTeachers === 1 ? '' : 's'}`,
                    `${subjectsData.summary.overallAttendance}% attendance`,
                  ]
                : undefined
            }
          />

          <HubCard
            icon={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
            title="Class Schedule"
            description="Your weekly timetable, day by day — lesson times, rooms, and which teacher takes each period."
            href={'/learning/timetable' as Href}
            backgroundColor={CardBackgroundColor}
            iconColor={Palette.accent}
            stats={
              scheduledDays && allEntries
                ? [
                    `${scheduledDays.length} school day${scheduledDays.length === 1 ? '' : 's'}`,
                    `${allEntries.length} periods/week`,
                  ]
                : undefined
            }
          />

          <HubCard
            icon={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }}
            title="Grades"
            description="Your term average, GPA, and a breakdown by subject."
            href={'/learning/grades' as Href}
            backgroundColor={CardBackgroundColor}
            iconColor={Palette.accent}
            stats={
              currentTerm && termAverage != null
                ? [`Average ${termAverage.toFixed(1)}%`, `GPA ${currentTerm.gpa.toFixed(2)}`]
                : undefined
            }
          />

          <HubCard
            icon={{ ios: 'checkmark.circle', android: 'event_available', web: 'event_available' }}
            title="Attendance"
            description="Your attendance rate this term, and how it breaks down by subject."
            href={'/learning/attendance' as Href}
            backgroundColor={CardBackgroundColor}
            iconColor={Palette.accent}
            stats={
              attendance
                ? [
                    `${attendance.summary.percentage}% present`,
                    `${attendance.summary.absent} absence${attendance.summary.absent === 1 ? '' : 's'}`,
                    `${attendance.summary.late} late`,
                  ]
                : undefined
            }
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}
