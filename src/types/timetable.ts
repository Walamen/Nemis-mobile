export type TimetableEntry = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: { id: string; name: string } | null;
  teacher: { id: string; firstName: string; lastName: string; photoUrl: string | null } | null;
  room: string | null;
};

export const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export type Timetable = Partial<Record<(typeof TIMETABLE_DAYS)[number], TimetableEntry[]>>;
