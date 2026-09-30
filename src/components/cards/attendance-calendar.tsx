import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/common/card';
import { SectionHeader } from '@/components/layout/section-header';
import { ThemedText } from '@/components/typography/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
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

type DayStyle = { bg: string; fg: string };
type StatusStyles = Record<Exclude<DayAttendanceStatus, 'NONE'>, DayStyle>;

// Status tints stay the same hue in both schemes; the day number is lightened
// in dark mode, where the light-mode shades read as near-black on a dark card.
const STATUS_STYLE: Record<'light' | 'dark', StatusStyles> = {
  light: {
    PRESENT: { bg: 'rgba(6,88,8,0.18)', fg: '#065808' },
    ABSENT: { bg: 'rgba(214,4,22,0.18)', fg: '#D60416' },
    LATE: { bg: 'rgba(166,115,28,0.2)', fg: '#A6731C' },
    EXCUSED: { bg: 'rgba(18,24,148,0.18)', fg: '#121894' },
    SICK: { bg: 'rgba(18,24,148,0.18)', fg: '#121894' },
  },
  dark: {
    PRESENT: { bg: 'rgba(92,194,106,0.22)', fg: '#7DD68A' },
    ABSENT: { bg: 'rgba(255,107,107,0.22)', fg: '#FF8A8A' },
    LATE: { bg: 'rgba(224,165,74,0.24)', fg: '#F0B866' },
    EXCUSED: { bg: 'rgba(138,144,240,0.24)', fg: '#AAB0FF' },
    SICK: { bg: 'rgba(138,144,240,0.24)', fg: '#AAB0FF' },
  },
};

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
  /** Overrides the default themed surface (`Card`'s `backgroundElement`). */
  backgroundColor?: string;
  className?: string;
};

/**
 * Current-month attendance heatmap: a "day → status" grid derived from
 * real per-subject attendance records, with a legend. Renders nothing
 * (not an empty grid) when none of the subjects have any calendar entries
 * for the month — see `buildMonthCalendar`'s doc comment for why. Shared
 * by the student and parent Attendance screens.
 */
export function AttendanceCalendar({
  subjects,
  backgroundColor,
  className,
}: AttendanceCalendarProps) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const now = new Date();
  const monthCalendar = buildMonthCalendar(subjects, now.getFullYear(), now.getMonth() + 1);
  if (!monthCalendar) return null;

  const statusStyles = STATUS_STYLE[scheme];
  const noneStyle: DayStyle = { bg: theme.backgroundSelected, fg: theme.textSecondary };
  const futureStyle: DayStyle = { bg: theme.backgroundElement, fg: theme.textSecondary };
  function dayStyle(cell: MonthCalendarDay): DayStyle {
    if (cell.isFuture) return futureStyle;
    return cell.status === 'NONE' ? noneStyle : statusStyles[cell.status];
  }

  const leadingBlanks = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;
  const weeks = chunkIntoWeeks(monthCalendar, leadingBlanks);

  return (
    <>
      <SectionHeader title={`${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`} />
      <Card backgroundColor={backgroundColor} className={`gap-3 ${className ?? ''}`}>
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
                        { backgroundColor: dayStyle(cell).bg, opacity: cell.isFuture ? 0.6 : 1 },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={{ color: dayStyle(cell).fg, fontWeight: '700' }}
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

        <View style={[styles.legendRow, { borderTopColor: theme.border }]}>
          <LegendSwatch color={statusStyles.PRESENT.bg} label="Present" />
          <LegendSwatch color={statusStyles.ABSENT.bg} label="Absent" />
          <LegendSwatch color={statusStyles.LATE.bg} label="Late" />
          <LegendSwatch color={noneStyle.bg} label="No school" />
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
