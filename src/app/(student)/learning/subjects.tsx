import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetSubjectsQuery } from '@/api/student/subjects-api';
import { SubjectCard } from '@/components/cards/subject-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';

export default function SubjectsScreen() {
  const router = useRouter();
  const { data, isLoading, isFetching, isError, refetch } = useGetSubjectsQuery();

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="My Subjects" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data?.subjects?.length}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={4} lines={3} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'book', android: 'menu_book', web: 'menu_book' }}
            title="No subjects yet"
            description="Your subjects will appear here once you're enrolled in a class."
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {data?.subjects?.map((subject) => (
            <SubjectCard
              key={subject.id}
              name={subject.name}
              teacherName={`${subject.teacher.firstName} ${subject.teacher.lastName}`}
              letterGrade={subject.performance.letterGrade}
              attendanceRate={subject.attendance.rate}
              trend={subject.performance.trend}
              onPress={() => router.push(`/learning/subject/${subject.id}` as Href)}
              className="mb-3"
            />
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
