import type { Href } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetChildAssessmentGradesQuery } from '@/api/parent/academics-api';
import { useGetChildAssignmentsQuery } from '@/api/parent/assignments-api';
import { useGetChildAttendanceQuery } from '@/api/parent/attendance-api';
import { AssignmentCard } from '@/components/cards/assignment-card';
import { AttendanceCard } from '@/components/cards/attendance-card';
import { GradeCard } from '@/components/cards/grade-card';
import { ChildGate } from '@/components/common/child-gate';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { SectionState } from '@/components/common/section-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { SkeletonProfile } from '@/components/loading/skeleton-profile';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { View } from '@/tw';
import { Image } from '@/tw/image';

const WHITE = '#FFFFFF';

/** The selected child's record — same layout language as the Student "My profile". */
export default function MyChildScreen() {
  const theme = useTheme();
  const { selectedChild, selectedChildId, isFetching, refetch } = useSelectedChild();
  const skip = !selectedChildId;

  const attendanceQuery = useGetChildAttendanceQuery({ childId: selectedChildId ?? '' }, { skip });
  const gradesQuery = useGetChildAssessmentGradesQuery(
    { childId: selectedChildId ?? '' },
    { skip },
  );
  const assignmentsQuery = useGetChildAssignmentsQuery(selectedChildId ?? '', { skip });

  const recentGrades = [...(gradesQuery.data ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  // "Needs attention" — not yet submitted (or submitted late), soonest due first.
  const dueAssignments = (assignmentsQuery.data ?? [])
    .filter((a) => a.status === 'PENDING' || a.status === 'LATE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);
  const attendance = attendanceQuery.data?.summary;

  const record = selectedChild
    ? [
        { label: 'Admission No.', value: selectedChild.studentId },
        { label: 'Class', value: selectedChild.grade },
        { label: 'Homeroom', value: selectedChild.homeroom },
        { label: 'School', value: selectedChild.school },
        { label: 'District', value: selectedChild.district },
        { label: 'Principal', value: selectedChild.principal },
        { label: 'Fees', value: selectedChild.feeLabel },
      ].filter((row) => !!row.value)
    : [];

  function refreshAll() {
    refetch();
    if (!skip) {
      attendanceQuery.refetch();
      gradesQuery.refetch();
      assignmentsQuery.refetch();
    }
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="My child" titleAlign="left" />
      <ChildGate loadingFallback={<SkeletonProfile fields={5} />}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refreshAll} />}
        >
          <ChildSwitcher />

          {selectedChild && (
            <>
              <View
                className="flex-row items-center gap-4 rounded-card p-5"
                style={{ backgroundColor: Palette.primary }}
              >
                <View
                  className="items-center justify-center overflow-hidden rounded-full"
                  style={{ width: 64, height: 64, backgroundColor: Palette.accent }}
                >
                  {selectedChild.photoUrl ? (
                    <Image
                      source={{ uri: selectedChild.photoUrl }}
                      className="h-full w-full"
                      contentFit="cover"
                    />
                  ) : (
                    <ThemedText style={{ color: WHITE, fontSize: 22, fontWeight: '700' }}>
                      {`${selectedChild.firstName.charAt(0)}${selectedChild.lastName.charAt(0)}`}
                    </ThemedText>
                  )}
                </View>
                <View className="flex-1 gap-1">
                  <ThemedText type="sectionHeading" style={{ color: WHITE }} numberOfLines={1}>
                    {selectedChild.firstName} {selectedChild.lastName}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: Palette.secondary100 }}>
                    {[selectedChild.grade, selectedChild.school].filter(Boolean).join(' · ')}
                  </ThemedText>
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
                        <ThemedText type="smallBold" className="flex-1 text-right">
                          {row.value}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <SectionHeader title="Attendance" href={'/academics/attendance' as Href} />
              <SectionState
                isLoading={attendanceQuery.isLoading}
                isError={attendanceQuery.isError && !attendance}
                error={attendanceQuery.error}
                isEmpty={!attendance || attendance.totalDays === 0}
                emptyMessage="No attendance recorded yet."
              >
                {attendance && (
                  <AttendanceCard
                    percentage={attendance.percentage}
                    present={attendance.present}
                    absent={attendance.absent}
                    late={attendance.late}
                    excused={attendance.excused}
                    backgroundColor={theme.card}
                  />
                )}
              </SectionState>

              <SectionHeader title="Recent grades" href={'/academics/results' as Href} />
              <SectionState
                isLoading={gradesQuery.isLoading}
                isError={gradesQuery.isError && !gradesQuery.data}
                error={gradesQuery.error}
                isEmpty={recentGrades.length === 0}
                emptyMessage="Grades will appear here once published."
              >
                <View className="gap-2">
                  {recentGrades.map((grade) => (
                    <GradeCard
                      key={grade.id}
                      subjectName={grade.subject}
                      label={grade.title}
                      percentage={grade.percentage}
                      letterGrade={grade.grade}
                      backgroundColor={theme.card}
                    />
                  ))}
                </View>
              </SectionState>

              <SectionHeader title="Assignments" href={'/tasks/assignments' as Href} />
              <SectionState
                isLoading={assignmentsQuery.isLoading}
                isError={assignmentsQuery.isError && !assignmentsQuery.data}
                error={assignmentsQuery.error}
                isEmpty={dueAssignments.length === 0}
                emptyMessage="No assignments need attention right now."
              >
                <View className="gap-2">
                  {dueAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      title={assignment.title}
                      subjectLabel={assignment.subject ?? 'General'}
                      dueDate={assignment.dueDate}
                      status={assignment.status}
                      backgroundColor={theme.card}
                    />
                  ))}
                </View>
              </SectionState>

              {selectedChild.subjects.length > 0 && (
                <>
                  <SectionHeader title="Subjects" />
                  <View
                    className="overflow-hidden rounded-card"
                    style={{ backgroundColor: theme.card }}
                  >
                    {selectedChild.subjects.map((subject, index) => (
                      <View
                        key={subject.name}
                        className="flex-row items-center justify-between gap-3 px-4 py-3.5"
                        style={
                          index < selectedChild.subjects.length - 1
                            ? { borderBottomWidth: 1, borderBottomColor: theme.border }
                            : undefined
                        }
                      >
                        <ThemedText type="small" className="flex-1">
                          {subject.name}
                        </ThemedText>
                        <ThemedText type="smallBold">{subject.finalGrade}</ThemedText>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      </ChildGate>
    </AppScreen>
  );
}
