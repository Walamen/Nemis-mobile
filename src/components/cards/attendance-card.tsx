import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';

export type AttendanceCardProps = {
  percentage: number;
  present: number;
  absent: number;
  late: number;
  /** Not every data source has these counts — `AttendanceSummary` (the
   * aggregated endpoint response) has `excused` but no `sick`; a
   * client-side count over raw attendance records can have both. Only
   * shown when passed. */
  excused?: number;
  sick?: number;
  onPress?: () => void;
  className?: string;
};

/** The "big percentage + present/absent/late breakdown" block repeated
 * across every attendance summary in the app — the student dashboard's
 * Attendance section, `(student)/learning/attendance.tsx`, and
 * `(student)/learning/subject/[id].tsx`'s per-subject attendance. */
export function AttendanceCard({
  percentage,
  present,
  absent,
  late,
  excused,
  sick,
  onPress,
  className,
}: AttendanceCardProps) {
  return (
    <Card onPress={onPress} className={className}>
      <ThemedText type="subtitle" className="text-2xl">
        {percentage.toFixed(0)}%
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {present} present · {absent} absent · {late} late
        {excused ? ` · ${excused} excused` : ''}
        {sick ? ` · ${sick} sick` : ''}
      </ThemedText>
    </Card>
  );
}
