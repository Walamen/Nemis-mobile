import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useGetResultsQuery } from '@/api/grades/grades-api';
import { GradeCard } from '@/components/cards/grade-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { CardBackgroundColor, Palette } from '@/theme';
import { Pressable } from '@/tw';

export default function GradesScreen() {
  const { data: terms, isLoading, isFetching, isError, refetch } = useGetResultsQuery();
  const theme = useTheme();
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  // Default to the most recently published term once loaded.
  const term = terms?.find((t) => t.termId === selectedTermId) ?? terms?.[terms.length - 1];
  const average = term?.termAverages.length
    ? term.termAverages.reduce((sum, s) => sum + s.average, 0) / term.termAverages.length
    : null;

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Grades" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={terms?.length === 0}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={4} lines={2} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }}
            title="No published grades yet"
            description="Check back once your teacher publishes results."
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {terms && terms.length > 1 && (
            <View style={styles.termRow}>
              {terms.map((t) => {
                const isSelected = t.termId === (term?.termId ?? null);
                return (
                  <Pressable
                    key={t.termId}
                    onPress={() => setSelectedTermId(t.termId)}
                    style={[
                      styles.termPill,
                      {
                        backgroundColor: isSelected
                          ? theme.backgroundSelected
                          : theme.backgroundElement,
                      },
                    ]}
                  >
                    <ThemedText type="smallBold">{t.termName}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          )}

          {term && (
            <View style={styles.hero}>
              <ThemedText type="small" style={styles.heroLabel}>
                Term average
              </ThemedText>
              <ThemedText type="title" style={styles.heroValue}>
                {average != null ? `${average.toFixed(1)}%` : '—'}
              </ThemedText>
              <View style={styles.heroStatsRow}>
                <View>
                  <ThemedText type="small" style={styles.heroLabel}>
                    GPA
                  </ThemedText>
                  <ThemedText type="smallBold" style={styles.heroStatValue}>
                    {term.gpa.toFixed(2)}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="small" style={styles.heroLabel}>
                    Class
                  </ThemedText>
                  <ThemedText type="smallBold" style={styles.heroStatValue}>
                    {term.className}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {term && <SectionHeader title="Subjects" />}
          {term?.termAverages.map((subject) => (
            <GradeCard
              key={subject.subjectId}
              subjectName={subject.subjectName}
              percentage={subject.average}
              letterGrade={subject.letterGrade}
              backgroundColor={CardBackgroundColor}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  termRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  termPill: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hero: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  heroLabel: {
    color: '#B3D9ED',
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 42,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 2,
  },
});
