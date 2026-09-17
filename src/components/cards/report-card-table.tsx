import { Fragment, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/common/empty-state';
import { ThemedText } from '@/components/typography/themed-text';
import { CardBackgroundColor, Palette } from '@/theme';
import type { ReportCard } from '@/types/grades';

type Term = ReportCard['terms'][number];
type Period = Term['periods'][number];
type GradeMap = Map<string, number>;

const COL = {
  subject: 132,
  period: 44,
  ave: 52,
  yearlyAve: 72,
} as const;

const EXAM_PERIOD_TYPES = ['FINAL_EXAM', 'MIDTERM_EXAM'];
const ORDINALS = ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH'];

function buildGradeMap(reportCard: ReportCard): GradeMap {
  return new Map(reportCard.grades.map((g) => [`${g.subjectId}::${g.periodId}`, g.score]));
}

/**
 * Ported bug-for-bug from the web SIS app's report card
 * (`apps/SIS/src/app/student/results/report-card/page.tsx`) — including
 * dividing by the *total* regular-period/term count rather than only the
 * ones with a published score — so a student sees the exact same numbers
 * here as on the web for the same data. See docs/PRODUCT_DECISIONS.md.
 */
function calcTermAverage(subjectId: string, term: Term, gradeMap: GradeMap): number | null {
  const regularPeriods = term.periods.filter((p) => p.periodType === 'REGULAR_PERIOD');
  const examPeriod = term.periods.find((p) => EXAM_PERIOD_TYPES.includes(p.periodType));

  const regularScores = regularPeriods
    .map((p) => gradeMap.get(`${subjectId}::${p.id}`))
    .filter((s): s is number => s !== undefined);
  const examScore = examPeriod ? gradeMap.get(`${subjectId}::${examPeriod.id}`) : undefined;

  if (regularScores.length === 0 && examScore === undefined) return null;

  if (regularScores.length > 0 && examScore !== undefined) {
    const regularMean = regularScores.reduce((a, b) => a + b, 0) / regularPeriods.length;
    return Math.ceil((regularMean + examScore) / 2);
  }
  if (regularScores.length > 0) {
    return Math.ceil(regularScores.reduce((a, b) => a + b, 0) / regularPeriods.length);
  }
  return Math.ceil(examScore as number);
}

function calcYearlyAverage(subjectId: string, terms: Term[], gradeMap: GradeMap): number | null {
  const termAverages = terms
    .map((t) => calcTermAverage(subjectId, t, gradeMap))
    .filter((a): a is number => a !== null);
  if (termAverages.length === 0) return null;
  return Math.round(termAverages.reduce((a, b) => a + b, 0) / terms.length);
}

function calcFinalAverage(
  subjects: ReportCard['subjects'],
  terms: Term[],
  gradeMap: GradeMap,
): number | null {
  const yearlyAverages = subjects
    .map((s) => calcYearlyAverage(s.id, terms, gradeMap))
    .filter((a): a is number => a !== null);
  if (yearlyAverages.length === 0) return null;
  return Math.round((yearlyAverages.reduce((a, b) => a + b, 0) / yearlyAverages.length) * 10) / 10;
}

/** `FINAL_EXAM`/`MIDTERM_EXAM` always read "EXAM"; regular periods are
 * numbered continuously across terms assuming 3 regular periods per term —
 * matches the web's own hardcoded scheme exactly (see `ORDINALS`/offset). */
function periodLabel(period: Period, termIndex: number): string {
  if (EXAM_PERIOD_TYPES.includes(period.periodType)) return 'EXAM';
  const offset = termIndex * 3;
  return ORDINALS[offset + period.sequence - 1] ?? period.name.toUpperCase();
}

function termColumnWidth(term: Term): number {
  return term.periods.length * COL.period + COL.ave;
}

export type ReportCardTableProps = {
  reportCard: ReportCard;
};

/**
 * The subject × term × grading-period score grid — the actual "report
 * card," distinct from the GPA/term-average summary
 * `(student)/learning/grades.tsx` already shows.
 *
 * React Native has no native `<table>`/colSpan/rowSpan. "SUBJECT" and
 * "YEARLY AVE." fake a 2-row rowSpan for free by simply having no explicit
 * height — flexbox's default `alignItems: 'stretch'` grows them to match
 * their tallest row sibling (the per-term column next to them, which is a
 * term-name row stacked on a period-label row).
 *
 * The whole grid — subject-name column included — scrolls horizontally as
 * one unit inside its own `ScrollView`, exactly like the web's
 * `overflow-x-auto` table (no sticky/frozen column); the screen around it
 * scrolls vertically as normal. Plain `ScrollView` from `'react-native'`,
 * not `@/tw`'s — that wrapper's css-interop mapping drops `style` on
 * `ScrollView` (see `AppScreen`'s and `ChildSwitcher`'s same choice).
 */
export function ReportCardTable({ reportCard }: ReportCardTableProps) {
  const gradeMap = useMemo(() => buildGradeMap(reportCard), [reportCard]);
  const { subjects, terms } = reportCard;

  const hasAnyPeriods = terms.some((t) => t.periods.length > 0);

  if (!hasAnyPeriods) {
    return (
      <EmptyState
        icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
        title="No grading periods have been set up yet"
        description={
          subjects.length > 0
            ? `Enrolled subjects: ${subjects.map((s) => s.name).join(', ')}`
            : 'Subjects will appear here once periods are created.'
        }
      />
    );
  }

  if (subjects.length === 0) {
    return (
      <EmptyState
        icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
        title="No subjects assigned yet"
        description="No subjects are assigned to your class yet."
      />
    );
  }

  const finalAverage = calcFinalAverage(subjects, terms, gradeMap);
  const termsTotalWidth = terms.reduce((sum, t) => sum + termColumnWidth(t), 0);
  // Explicit, not left to flexbox's implicit "hug content" sizing — every
  // published grading period adds a column here, and this must always grow
  // to match so the `ScrollView` below has something wider than the screen
  // to scroll, no matter how many terms/periods a school ends up with.
  const totalWidth = COL.subject + termsTotalWidth + COL.yearlyAve;

  return (
    <View style={[styles.wrap, { backgroundColor: CardBackgroundColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // Nested inside the screen's own vertical ScrollView — without this,
        // Android's touch arbitration can hand every drag to the outer
        // (vertical) scroller and this one never receives a horizontal pan.
        // No-op on iOS.
        nestedScrollEnabled
      >
        <View style={{ width: totalWidth }}>
          <View style={styles.row}>
            <View style={[styles.headerCell, styles.subjectCol, styles.spanCell]}>
              <ThemedText type="smallBold" style={styles.headerText}>
                SUBJECT
              </ThemedText>
            </View>
            {terms.map((term, termIndex) => (
              <View key={term.id} style={{ width: termColumnWidth(term) }}>
                <View style={[styles.headerCell, styles.termNameCell]}>
                  <ThemedText type="smallBold" style={styles.headerText} numberOfLines={1}>
                    {term.name.toUpperCase()}
                  </ThemedText>
                </View>
                <View style={styles.row}>
                  {term.periods.map((period) => (
                    <View key={period.id} style={[styles.headerCell, { width: COL.period }]}>
                      <ThemedText type="small" style={styles.headerText}>
                        {periodLabel(period, termIndex)}
                      </ThemedText>
                    </View>
                  ))}
                  <View
                    style={[
                      styles.headerCell,
                      { width: COL.ave, backgroundColor: Palette.accent100 },
                    ]}
                  >
                    <ThemedText type="smallBold" style={styles.headerText}>
                      AVE.
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
            <View
              style={[
                styles.headerCell,
                styles.yearlyAveCol,
                styles.spanCell,
                { backgroundColor: Palette.accent100 },
              ]}
            >
              <ThemedText type="smallBold" style={styles.headerText}>
                {'YEARLY\nAVE.'}
              </ThemedText>
            </View>
          </View>

          {subjects.map((subject) => {
            const yearlyAverage = calcYearlyAverage(subject.id, terms, gradeMap);
            return (
              <View key={subject.id} style={styles.row}>
                <View style={[styles.bodyCell, styles.subjectCol]}>
                  <ThemedText type="small" numberOfLines={2}>
                    {subject.name}
                  </ThemedText>
                </View>
                {terms.map((term) => {
                  const termAverage = calcTermAverage(subject.id, term, gradeMap);
                  return (
                    <Fragment key={term.id}>
                      {term.periods.map((period) => {
                        const score = gradeMap.get(`${subject.id}::${period.id}`);
                        return (
                          <View key={period.id} style={[styles.bodyCell, { width: COL.period }]}>
                            <ThemedText
                              type="small"
                              themeColor={score === undefined ? 'textSecondary' : undefined}
                            >
                              {score ?? '–'}
                            </ThemedText>
                          </View>
                        );
                      })}
                      <View
                        style={[
                          styles.bodyCell,
                          { width: COL.ave, backgroundColor: Palette.accent50 },
                        ]}
                      >
                        <ThemedText
                          type="smallBold"
                          themeColor={termAverage === null ? 'textSecondary' : undefined}
                        >
                          {termAverage ?? '–'}
                        </ThemedText>
                      </View>
                    </Fragment>
                  );
                })}
                <View
                  style={[
                    styles.bodyCell,
                    styles.yearlyAveCol,
                    { backgroundColor: Palette.accent50 },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    themeColor={yearlyAverage === null ? 'textSecondary' : undefined}
                  >
                    {yearlyAverage ?? '–'}
                  </ThemedText>
                </View>
              </View>
            );
          })}

          <View style={[styles.row, styles.footerRow]}>
            <View style={[styles.bodyCell, styles.subjectCol]}>
              <ThemedText type="smallBold" style={styles.footerText}>
                Final Average
              </ThemedText>
            </View>
            <View style={[styles.bodyCell, { width: termsTotalWidth }]}>
              <ThemedText type="small" style={[styles.footerText, styles.centerText]}>
                Mean of all subject yearly averages
              </ThemedText>
            </View>
            <View style={[styles.bodyCell, styles.yearlyAveCol]}>
              <ThemedText type="smallBold" style={styles.footerText}>
                {finalAverage != null ? finalAverage.toFixed(1) : '–'}
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  spanCell: {
    justifyContent: 'center',
  },
  headerCell: {
    padding: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 10,
    textAlign: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  subjectCol: {
    width: COL.subject,
    alignItems: 'flex-start',
  },
  termNameCell: {
    paddingVertical: 8,
  },
  yearlyAveCol: {
    width: COL.yearlyAve,
  },
  bodyCell: {
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    backgroundColor: Palette.primary,
  },
  footerText: {
    color: '#FFFFFF',
  },
});
