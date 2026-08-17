import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/common/card';
import { SectionHeader } from '@/components/layout/section-header';
import { ThemedText } from '@/components/typography/themed-text';
import type { AttendanceBySubject } from '@/types/attendance';
import {
  buildMonthCalendar,
  type DayAttendanceStatus,
  type MonthCalendarDay,
} from '@/utils/attendance';

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_STYLE: Record<DayAttendanceStatus, { bg: string; fg: string }> = {
  PRESENT: { bg: 'rgba(6,88,8,0.18)', fg: '#065808' },
  ABSENT: { bg: 'rgba(214,4,22,0.18)', fg: '#D60416' },
  LATE: { bg: 'rgba(166,115,28,0.2)', fg: '#A6731C' },
  EXCUSED: { bg: 'rgba(18,24,148,0.18)', fg: '#121894' },
  SICK: { bg: 'rgba(18,24,148,0.18)', fg: '#121894' },
  NONE: { bg: '#E0E1E6', fg: '#9AA0A6' },
};
const FUTURE_STYLE = { bg: '#F7F7F9', fg: '#C4C7CC' };

function chunkIntoWeeks(
  days: MonthCalendarDay[],
  leadingBlanks: number,
): (MonthCalendarDay | null)[][] {
  const padded: (MonthCalendarDay | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...days,
  ];
  const weeks: (MonthCalendarDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const week = padded.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export type AttendanceCalendarProps = {
  /** Per-subject attendance records — merged into one day-by-day view
   * (see `buildMonthCalendar`), since the API tracks attendance per
   * subject rather than one combined daily record. */
  subjects: AttendanceBySubject[];
  className?: string;
};

/**
 * Current-month attendance heatmap: a "day → status" grid derived from
 * real per-subject attendance records, with a legend. Renders nothing
 * (not an empty grid) when none of the subjects have any calendar entries
 * for the month — see `buildMonthCalendar`'s doc comment for why. Shared
 * by the student and parent Attendance screens.
 */
export function AttendanceCalendar({ subjects, className }: AttendanceCalendarProps) {
  const now = new Date();
  const monthCalendar = buildMonthCalendar(subjects, now.getFullYear(), now.getMonth() + 1);
  if (!monthCalendar) return null;

  const leadingBlanks = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;
  const weeks = chunkIntoWeeks(monthCalendar, leadingBlanks);

  return (
    <>
      <SectionHeader title={`${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`} />
      <Card className={`gap-3 ${className ?? ''}`}>
        <View style={styles.row}>
          {WEEKDAY_LETTERS.map((letter, i) => (
            <ThemedText
              key={`${letter}-${i}`}
              type="small"
              themeColor="textSecondary"
              style={styles.weekdayLabel}
            >
              {letter}
            </ThemedText>
          ))}
        </View>

        <View style={styles.gridBody}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.row}>
              {week.map((cell, i) =>
                cell ? (
                  <View key={cell.day} style={styles.dayCellWrap}>
                    <View
                      style={[
                        styles.dayCell,
                        {
                          backgroundColor: cell.isFuture
                            ? FUTURE_STYLE.bg
                            : DAY_STYLE[cell.status].bg,
                        },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={{
                          color: cell.isFuture ? FUTURE_STYLE.fg : DAY_STYLE[cell.status].fg,
                          fontWeight: '700',
                        }}
                      >
                        {cell.day}
                      </ThemedText>
                    </View>
                  </View>
                ) : (
                  <View key={`blank-${i}`} style={styles.dayCellWrap} />
                ),
              )}
            </View>
          ))}
        </View>

        <View style={styles.legendRow}>
          <LegendSwatch color={DAY_STYLE.PRESENT.bg} label="Present" />
          <LegendSwatch color={DAY_STYLE.ABSENT.bg} label="Absent" />
          <LegendSwatch color={DAY_STYLE.LATE.bg} label="Late" />
          <LegendSwatch color={DAY_STYLE.NONE.bg} label="No school" />
        </View>
      </Card>
    </>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
  },
  gridBody: {
    gap: 6,
  },
  dayCellWrap: {
    flex: 1,
    paddingHorizontal: 3,
  },
  dayCell: {
    aspectRatio: 1,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E1E6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
});
