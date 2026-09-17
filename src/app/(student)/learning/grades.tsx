import type { Href } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useGetAssessmentGradesQuery, useGetResultsQuery } from '@/api/grades/grades-api';
import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { EmptyState } from '@/components/common/empty-state';
import { FilterPills } from '@/components/common/filter-pills';
import { Icon } from '@/components/common/icon';
import { QueryState } from '@/components/common/query-state';
import { SectionState } from '@/components/common/section-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { CardBackgroundColor, Palette } from '@/theme';
import { Link, Pressable } from '@/tw';
import type { AssessmentGrade } from '@/types/grades';

const ALL = 'ALL';

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

type SubjectGroup = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  average?: { average: number; letterGrade: string };
  assessments: AssessmentGrade[];
};

export default function GradesScreen() {
  const { data: terms, isLoading, isFetching, isError, refetch } = useGetResultsQuery();
  const theme = useTheme();
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  // Grading Period/Subject go to the server (`AssessmentGradesQuery` already
  // supports both); Type doesn't have a server param, so it's applied
  // client-side over whatever the server already returned.
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Set<string>>(new Set());

  function toggleSubject(subjectId: string) {
    setExpandedSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  }

  // Default to the most recently published term once loaded.
  const term = terms?.find((t) => t.termId === selectedTermId) ?? terms?.[terms.length - 1];
  const average = term?.termAverages.length
    ? term.termAverages.reduce((sum, s) => sum + s.average, 0) / term.termAverages.length
    : null;

  const periodOptions =
    term?.gradingPeriods.map((p) => ({ key: p.periodId, label: p.periodName })) ?? [];
  const subjectOptions =
    term?.termAverages.map((s) => ({ key: s.subjectId, label: s.subjectName })) ?? [];

  // A period/subject picked under one term may not exist under another —
  // rather than resetting state in an effect when the term changes, just
  // stop trusting the stored id once it's no longer one of the current
  // term's options. Falls back to "All" for both the query and the pill
  // row's displayed selection.
  const effectivePeriodId = periodOptions.some((p) => p.key === selectedPeriodId)
    ? selectedPeriodId
    : null;
  const effectiveSubjectId = subjectOptions.some((s) => s.key === selectedSubjectId)
    ? selectedSubjectId
    : null;

  const {
    data: assessments,
    isLoading: isAssessmentsLoading,
    isError: isAssessmentsError,
  } = useGetAssessmentGradesQuery(
    {
      termId: term?.termId,
      gradingPeriodId: effectivePeriodId ?? undefined,
      subjectId: effectiveSubjectId ?? undefined,
    },
    { skip: !term },
  );

  const filteredAssessments = (assessments ?? []).filter(
    (a) => !selectedType || a.assessmentType === selectedType,
  );

  const groups: SubjectGroup[] = [];
  const groupsById = new Map<string, SubjectGroup>();
  for (const a of filteredAssessments) {
    const existing = groupsById.get(a.subjectId);
    if (existing) {
      existing.assessments.push(a);
      continue;
    }
    const group: SubjectGroup = {
      subjectId: a.subjectId,
      subjectName: a.subjectName,
      subjectCode: a.subjectCode,
      average: term?.termAverages.find((s) => s.subjectId === a.subjectId),
      assessments: [a],
    };
    groupsById.set(a.subjectId, group);
    groups.push(group);
  }
  groups.sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  const typeOptions = Array.from(new Set((assessments ?? []).map((a) => a.assessmentType))).map(
    (t) => ({ key: t, label: toTitleCase(t) }),
  );

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
          contentContainerStyle={{ paddingBottom: 32 }}
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

          <Link
            href={'/learning/report-card' as Href}
            className="mb-4 mt-4 rounded-card p-4"
            style={{ backgroundColor: theme.backgroundElement }}
          >
            <ThemedText type="smallBold">View report card</ThemedText>
          </Link>

          {term && (periodOptions.length > 0 || subjectOptions.length > 0) && (
            <>
              <SectionHeader title="Filter" />
              <View style={styles.filterGroup}>
                {periodOptions.length > 0 && (
                  <View style={styles.filterRow}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Grading Period
                    </ThemedText>
                    <FilterPills
                      options={[{ key: ALL, label: 'All Periods' }, ...periodOptions]}
                      value={effectivePeriodId ?? ALL}
                      onChange={(key) => setSelectedPeriodId(key === ALL ? null : key)}
                    />
                  </View>
                )}
                {subjectOptions.length > 0 && (
                  <View style={styles.filterRow}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Subject
                    </ThemedText>
                    <FilterPills
                      options={[{ key: ALL, label: 'All Subjects' }, ...subjectOptions]}
                      value={effectiveSubjectId ?? ALL}
                      onChange={(key) => setSelectedSubjectId(key === ALL ? null : key)}
                    />
                  </View>
                )}
                {typeOptions.length > 0 && (
                  <View style={styles.filterRow}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Type
                    </ThemedText>
                    <FilterPills
                      options={[{ key: ALL, label: 'All Types' }, ...typeOptions]}
                      value={selectedType ?? ALL}
                      onChange={(key) => setSelectedType(key === ALL ? null : key)}
                    />
                  </View>
                )}
              </View>
            </>
          )}

          {term && (
            <>
              <SectionHeader title="Subjects" />
              <SectionState
                isLoading={isAssessmentsLoading}
                isError={isAssessmentsError}
                isEmpty={groups.length === 0}
                emptyMessage="No assessments match these filters."
              >
                <View style={styles.groupList}>
                  {groups.map((group) => {
                    const isExpanded = expandedSubjectIds.has(group.subjectId);
                    return (
                      <Card
                        key={group.subjectId}
                        onPress={() => toggleSubject(group.subjectId)}
                        backgroundColor={CardBackgroundColor}
                      >
                        <View style={styles.groupHeaderRow}>
                          <View style={styles.flex1}>
                            <ThemedText type="smallBold">
                              {group.subjectName}
                              {group.subjectCode ? ` · ${group.subjectCode}` : ''}
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">
                              {group.assessments.length} assessment
                              {group.assessments.length === 1 ? '' : 's'}
                              {group.average
                                ? ` · ${group.average.average.toFixed(1)}% (${group.average.letterGrade})`
                                : ''}
                            </ThemedText>
                          </View>
                          <Icon
                            name={{
                              ios: 'chevron.right',
                              android: 'chevron_right',
                              web: 'chevron_right',
                            }}
                            size="sm"
                            color={theme.textSecondary}
                            style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                          />
                        </View>
                        {isExpanded && (
                          <View style={styles.assessmentList}>
                            {group.assessments.map((assessment) => (
                              <View key={assessment.id} style={styles.assessmentRow}>
                                <View style={styles.flex1}>
                                  <ThemedText type="smallBold">
                                    {assessment.assessmentName}
                                  </ThemedText>
                                  <View style={styles.assessmentMetaRow}>
                                    <Badge
                                      label={toTitleCase(assessment.assessmentType)}
                                      tone="info"
                                    />
                                    <ThemedText type="small" themeColor="textSecondary">
                                      {assessment.gradingPeriodName
                                        ? `${assessment.gradingPeriodName} · `
                                        : ''}
                                      {new Date(assessment.assessmentDate).toLocaleDateString()}
                                    </ThemedText>
                                  </View>
                                </View>
                                <ThemedText type="smallBold">
                                  {assessment.marksObtained}/{assessment.maxMarks}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        )}
                      </Card>
                    );
                  })}
                </View>
              </SectionState>
            </>
          )}
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
  filterGroup: {
    gap: 12,
    marginBottom: 4,
  },
  filterRow: {
    gap: 6,
  },
  groupList: {
    gap: 8,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  assessmentList: {
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.border,
  },
  assessmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  flex1: {
    flex: 1,
    gap: 2,
  },
  assessmentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
