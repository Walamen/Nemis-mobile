import type { Href } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetChildAssessmentGradesQuery } from '@/api/parent/academics-api';
import { useGetChildAttendanceQuery } from '@/api/parent/attendance-api';
import { useGetChildAssignmentsQuery } from '@/api/parent/assignments-api';
import { AssignmentCard } from '@/components/cards/assignment-card';
import { GradeCard } from '@/components/cards/grade-card';
import { Card } from '@/components/common/card';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { SectionState } from '@/components/common/section-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { View } from '@/tw';
import { Image } from '@/tw/image';

export default function MyChildScreen() {
  const { selectedChild, selectedChildId, isLoading, isFetching, isError, refetch } =
    useSelectedChild();

  const {
    data: attendance,
    isLoading: isAttendanceLoading,
    isError: isAttendanceError,
  } = useGetChildAttendanceQuery({ childId: selectedChildId ?? '' }, { skip: !selectedChildId });
  const {
    data: grades,
    isLoading: isGradesLoading,
    isError: isGradesError,
  } = useGetChildAssessmentGradesQuery(
    { childId: selectedChildId ?? '' },
    { skip: !selectedChildId },
  );
  const {
    data: assignments,
    isLoading: isAssignmentsLoading,
    isError: isAssignmentsError,
  } = useGetChildAssignmentsQuery(selectedChildId ?? '', { skip: !selectedChildId });

  const recentGrades = [...(grades ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  // "Needs attention" — not yet submitted (or submitted late), soonest due first.
  const dueAssignments = (assignments ?? [])
    .filter((a) => a.status === 'PENDING' || a.status === 'LATE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="My Child" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!selectedChild}
        onRetry={refetch}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }}
            title="No children linked yet"
            description="Your linked children will appear here once your account is connected to their record."
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ChildSwitcher />

          {selectedChild && (
            <>
              <ThemedView className="mb-4 items-center gap-2">
                {selectedChild.photoUrl && (
                  <Image
                    source={{ uri: selectedChild.photoUrl }}
                    className="h-24 w-24 rounded-full"
                  />
                )}
                <ThemedText type="subtitle">
                  {selectedChild.firstName} {selectedChild.lastName}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Admission No. {selectedChild.studentId}
                </ThemedText>
              </ThemedView>

              <InfoRow label="Class" value={selectedChild.grade} />
              <InfoRow label="Homeroom" value={selectedChild.homeroom || '—'} />
              <InfoRow label="School" value={selectedChild.school} />
              <InfoRow label="District" value={selectedChild.district || '—'} />
              <InfoRow label="Principal" value={selectedChild.principal || '—'} />
              <InfoRow label="Fees" value={selectedChild.feeLabel} />

              <SectionHeader title="Attendance" href={'/academics/attendance' as Href} />
              <SectionState
                isLoading={isAttendanceLoading}
                isError={isAttendanceError}
                emptyMessage="No attendance recorded yet."
              >
                <Card className="mb-2">
                  <ThemedText type="subtitle" className="text-2xl">
                    {attendance?.summary.percentage ?? 0}%
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {attendance?.summary.present ?? 0} present · {attendance?.summary.absent ?? 0}{' '}
                    absent · {attendance?.summary.late ?? 0} late
                  </ThemedText>
                </Card>
              </SectionState>

              <SectionHeader title="Recent Grades" href={'/academics/results' as Href} />
              <SectionState
                isLoading={isGradesLoading}
                isError={isGradesError}
                isEmpty={recentGrades.length === 0}
                emptyMessage="Grades will appear here once published."
              >
                <View className="mb-2 gap-2">
                  {recentGrades.map((grade) => (
                    <GradeCard
                      key={grade.id}
                      subjectName={grade.subject}
                      label={grade.title}
                      percentage={grade.percentage}
                      letterGrade={grade.grade}
                    />
                  ))}
                </View>
              </SectionState>

              <SectionHeader title="Assignments" href={'/tasks/assignments' as Href} />
              <SectionState
                isLoading={isAssignmentsLoading}
                isError={isAssignmentsError}
                isEmpty={dueAssignments.length === 0}
                emptyMessage="No assignments need attention right now."
              >
                <View className="mb-2 gap-2">
                  {dueAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      title={assignment.title}
                      subjectLabel={assignment.subject ?? 'General'}
                      dueDate={assignment.dueDate}
                      status={assignment.status}
                    />
                  ))}
                </View>
              </SectionState>

              {selectedChild.subjects.length > 0 && (
                <>
                  <SectionHeader title="Subjects" />
                  {selectedChild.subjects.map((subject) => (
                    <Card key={subject.name} className="mb-2 flex-row items-center justify-between">
                      <ThemedText type="small">{subject.name}</ThemedText>
                      <ThemedText type="smallBold">{subject.finalGrade}</ThemedText>
                    </Card>
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Card className="mb-2 flex-row items-center justify-between">
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </Card>
  );
}
