import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetSubjectDetailQuery } from '@/api/student/subjects-api';
import { AssignmentCard, type AssignmentStatus } from '@/components/cards/assignment-card';
import { AttendanceCard } from '@/components/cards/attendance-card';
import { GradeCard } from '@/components/cards/grade-card';
import { StatCard } from '@/components/cards/stat-card';
import { Badge, type BadgeTone } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { ThemedText } from '@/components/typography/themed-text';
import { CardBackgroundColor } from '@/theme';
import type { AttendanceStatus } from '@/types/attendance';
import type { SubjectAssignment } from '@/types/subjects';
import { View } from '@/tw';

// The subject-detail endpoint sends lowercase assignment statuses
// ('pending'|'submitted'|'graded'|'missing'), a different casing convention
// than the uppercase AssignmentStatus union `/tasks/assignments` and the
// dashboards use — mapped here rather than widening AssignmentCard's shared
// type for one caller. See docs/ROADMAP.md.
const ASSIGNMENT_STATUS_MAP: Record<SubjectAssignment['status'], AssignmentStatus> = {
  pending: 'PENDING',
  submitted: 'SUBMITTED',
  graded: 'GRADED',
  missing: 'MISSING',
};

const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  EXCUSED: 'Excused',
  SICK: 'Sick',
};

const ATTENDANCE_TONE: Record<AttendanceStatus, BadgeTone> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  EXCUSED: 'info',
  SICK: 'info',
};

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: subject,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetSubjectDetailQuery(id ?? '', { skip: !id });

  const attendanceCounts = (subject?.attendanceRecords ?? []).reduce<
    Partial<Record<AttendanceStatus, number>>
  >((counts, record) => {
    counts[record.status] = (counts[record.status] ?? 0) + 1;
    return counts;
  }, {});
  const recentAttendance = [...(subject?.attendanceRecords ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title={subject?.name ?? 'Subject'} />
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {subject && (
            <>
              <Card backgroundColor={CardBackgroundColor} className="mb-4">
                <ThemedText type="smallBold">
                  {subject.teacher.firstName} {subject.teacher.lastName}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {subject.className} · {subject.code}
                </ThemedText>
                {subject.description && <ThemedText type="small">{subject.description}</ThemedText>}
              </Card>

              <View className="flex-row gap-3">
                <StatCard
                  label="Current Grade"
                  value={`${subject.performance.letterGrade} (${subject.performance.currentGrade.toFixed(1)}%)`}
                  trend={
                    subject.performance.trend === 'stable'
                      ? undefined
                      : {
                          direction: subject.performance.trend,
                          label: subject.performance.trend === 'up' ? 'Improving' : 'Declining',
                        }
                  }
                  backgroundColor={CardBackgroundColor}
                />
                <StatCard
                  label="Attendance Rate"
                  value={`${subject.attendance.rate.toFixed(0)}%`}
                  backgroundColor={CardBackgroundColor}
                />
              </View>

              {subject.schedule.length > 0 && (
                <>
                  <SectionHeader title="Schedule" />
                  {subject.schedule.map((entry, index) => (
                    <Card
                      key={`${entry.dayOfWeek}-${index}`}
                      backgroundColor={CardBackgroundColor}
                      className="mb-2 flex-row items-center justify-between"
                    >
                      <ThemedText type="small">{entry.dayOfWeek}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {entry.startTime}–{entry.endTime}
                        {entry.room ? ` · Room ${entry.room}` : ''}
                      </ThemedText>
                    </Card>
                  ))}
                </>
              )}

              <SectionHeader title="Attendance" />
              <AttendanceCard
                percentage={subject.attendance.rate}
                present={attendanceCounts.PRESENT ?? 0}
                absent={attendanceCounts.ABSENT ?? 0}
                late={attendanceCounts.LATE ?? 0}
                excused={attendanceCounts.EXCUSED}
                sick={attendanceCounts.SICK}
                backgroundColor={CardBackgroundColor}
                className="mb-2"
              />
              {recentAttendance.map((record, index) => (
                <Card
                  key={`${record.date}-${index}`}
                  backgroundColor={CardBackgroundColor}
                  className="mb-2 flex-row items-center justify-between"
                >
                  <ThemedText type="small">{new Date(record.date).toLocaleDateString()}</ThemedText>
                  <Badge
                    label={ATTENDANCE_LABEL[record.status]}
                    tone={ATTENDANCE_TONE[record.status]}
                  />
                </Card>
              ))}

              <SectionHeader title="Grade History" />
              {subject.gradeHistory.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary" className="mb-2">
                  No grades recorded yet.
                </ThemedText>
              ) : (
                subject.gradeHistory.map((entry) => (
                  <GradeCard
                    key={entry.id}
                    subjectName={entry.assessmentName}
                    label={`${entry.assessmentType} · ${new Date(entry.date).toLocaleDateString()}`}
                    percentage={entry.percentage}
                    backgroundColor={CardBackgroundColor}
                    className="mb-2"
                  />
                ))
              )}

              <SectionHeader title="Assignments" />
              {subject.allAssignments.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary" className="mb-2">
                  No assignments yet.
                </ThemedText>
              ) : (
                subject.allAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    title={assignment.title}
                    dueDate={assignment.dueDate}
                    status={ASSIGNMENT_STATUS_MAP[assignment.status]}
                    backgroundColor={CardBackgroundColor}
                    className="mb-2"
                  />
                ))
              )}
            </>
          )}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
