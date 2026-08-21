import { RefreshControl, ScrollView } from 'react-native';

import { useGetMyAttendanceQuery } from '@/api/attendance/attendance-api';
import { AttendanceCalendar } from '@/components/cards/attendance-calendar';
import { AttendanceCard } from '@/components/cards/attendance-card';
import { Card } from '@/components/common/card';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { ThemedText } from '@/components/typography/themed-text';
import { CardBackgroundColor } from '@/theme';

export default function AttendanceScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetMyAttendanceQuery();

  return (
    <AppScreen scroll={false} contentClassName="" edges={['top', 'left', 'right']}>
      <AppHeader title="Attendance" />
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <AttendanceCard
            percentage={data?.summary.percentage ?? 0}
            present={data?.summary.present ?? 0}
            absent={data?.summary.absent ?? 0}
            late={data?.summary.late ?? 0}
            excused={data?.summary.excused}
            backgroundColor={CardBackgroundColor}
            className="mb-4"
          />

          <AttendanceCalendar
            subjects={data?.subjects ?? []}
            backgroundColor={CardBackgroundColor}
            className="mb-4"
          />

          <SectionHeader title="By Subject" />

          {data?.subjects?.map((subject) => (
            <Card
              key={subject.subjectId}
              backgroundColor={CardBackgroundColor}
              className="mb-2 flex-row items-center justify-between"
            >
              <ThemedText type="small">{subject.subjectName}</ThemedText>
              <ThemedText type="smallBold">{subject.summary.percentage}%</ThemedText>
            </Card>
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
