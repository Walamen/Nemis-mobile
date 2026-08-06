import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetResultsQuery } from '@/api/grades/grades-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export default function GradesScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetResultsQuery();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        emptyMessage="No published grades yet."
        onRetry={refetch}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {data?.map((term) => (
            <ThemedView key={term.termId} style={{ marginBottom: 16, gap: 8 }}>
              <ThemedView
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <ThemedText type="smallBold">{term.termName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  GPA: {term.gpa.toFixed(2)}
                </ThemedText>
              </ThemedView>
              {term.termAverages.map((subject) => (
                <ThemedView
                  key={subject.subjectId}
                  type="backgroundElement"
                  className="flex-row items-center justify-between rounded-card p-4"
                >
                  <ThemedText type="small">{subject.subjectName}</ThemedText>
                  <ThemedText type="smallBold">
                    {subject.average.toFixed(1)}% ({subject.letterGrade})
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
