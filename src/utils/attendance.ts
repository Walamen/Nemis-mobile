import type { AttendanceBySubject, AttendanceStatus } from '@/types/attendance';

export type DayAttendanceStatus = AttendanceStatus | 'NONE';

export type MonthCalendarDay = {
  day: number;
  status: DayAttendanceStatus;
  /** True for dates after today — rendered as "not yet happened" rather
   * than "no school", so an unmarked future day doesn't read as absence. */
  isFuture: boolean;
};

const STATUS_PRIORITY: AttendanceStatus[] = ['ABSENT', 'LATE', 'SICK', 'EXCUSED', 'PRESENT'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Merges every subject's per-day `calendar` (each subject is tracked
 * separately by the API — there's no single combined daily record) into
 * one overall day status for a given month: if any subject marks a day
 * absent, the day shows absent; otherwise the "worst" status across
 * subjects wins (see `STATUS_PRIORITY`). Returns `null` when none of the
 * subjects have any calendar entries for the month at all, so the caller
 * can skip rendering the grid instead of showing an empty one — this
 * field isn't exercised anywhere else in the app yet, so a screen
 * shouldn't assume the key format is confirmed correct.
 */
export function buildMonthCalendar(
  subjects: AttendanceBySubject[],
  year: number,
  month: number,
): MonthCalendarDay[] | null {
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let matchedAny = false;
  const result: MonthCalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${pad(month)}-${pad(day)}`;
    const statusesForDay: AttendanceStatus[] = [];

    for (const subject of subjects) {
      const entry = subject.calendar[key];
      if (entry) {
        matchedAny = true;
        statusesForDay.push(entry.status);
      }
    }

    const worst = STATUS_PRIORITY.find((status) => statusesForDay.includes(status));
    const date = new Date(year, month - 1, day);

    result.push({
      day,
      status: worst ?? 'NONE',
      isFuture: date.getTime() > today.getTime(),
    });
  }

  return matchedAny ? result : null;
}
