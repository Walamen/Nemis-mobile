import { ScrollView, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/common/badge';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Fonts, Palette } from '@/theme';
import type { ReportCard, ReportCardColumn, ReportCardPayload } from '@/types/grades';
import { withAlpha } from '@/utils/color';
import { formatNemisIdInput } from '@/utils/nemis-id';
import {
  formatGradeLevel,
  formatScore,
  outcomeText,
  priorRecordBySchool,
  reportKindLabel,
  studentFullName,
} from '@/utils/report-card';

const SUBJECT_WIDTH = 120;
const COLUMN_WIDTH: Record<ReportCardColumn['kind'], number> = {
  PERIOD: 76,
  TERM_AVERAGE: 84,
  YEARLY_AVERAGE: 76,
};

/** Term-average and yearly columns stand out from period columns, as on the
 * web (light blue for a term, grey for the year — both theme-aware). */
function useColumnTint() {
  const theme = useTheme();
  return (kind: ReportCardColumn['kind']) =>
    kind === 'TERM_AVERAGE'
      ? withAlpha(Palette.accent, 0.1)
      : kind === 'YEARLY_AVERAGE'
        ? theme.backgroundSelected
        : undefined;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fact}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.factLabel}>
        {label.toUpperCase()}
      </ThemedText>
      {children}
    </View>
  );
}

function ScoreTable({ payload }: { payload: ReportCardPayload }) {
  const theme = useTheme();
  const tint = useColumnTint();
  const { columns, subjects, overall } = payload;
  const width = SUBJECT_WIDTH + columns.reduce((sum, c) => sum + COLUMN_WIDTH[c.kind], 0);
  const border = { borderColor: theme.backgroundSelected };

  return (
    <View style={[styles.tableWrap, border]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
        <View style={{ width }}>
          <View style={[styles.row, { backgroundColor: withAlpha(Palette.accent, 0.18) }]}>
            <View style={[styles.cell, styles.subjectCell]}>
              <ThemedText type="smallBold" style={styles.headerText}>
                SUBJECT
              </ThemedText>
            </View>
            {columns.map((column) => (
              <View key={column.key} style={[styles.cell, { width: COLUMN_WIDTH[column.kind] }]}>
                <ThemedText type="smallBold" style={[styles.headerText, styles.center]}>
                  {column.label.toUpperCase()}
                </ThemedText>
              </View>
            ))}
          </View>

          {subjects.map((subject) => (
            <View key={subject.subjectId} style={[styles.row, styles.rowDivider, border]}>
              <View style={[styles.cell, styles.subjectCell]}>
                <ThemedText type="small" numberOfLines={2}>
                  {subject.name}
                </ThemedText>
              </View>
              {columns.map((column) => {
                const cell = subject.cells[column.key];
                const emphasised = column.kind !== 'PERIOD';
                return (
                  <View
                    key={column.key}
                    style={[
                      styles.cell,
                      { width: COLUMN_WIDTH[column.kind], backgroundColor: tint(column.kind) },
                    ]}
                  >
                    <ThemedText
                      type={emphasised ? 'smallBold' : 'small'}
                      themeColor={cell?.value == null ? 'textSecondary' : undefined}
                    >
                      {formatScore(cell?.value)}
                    </ThemedText>
                    {cell?.source === 'CARRIED' && cell.sourceSchoolName && (
                      <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        style={[styles.cellNote, styles.center]}
                        numberOfLines={2}
                      >
                        {cell.sourceSchoolName}
                      </ThemedText>
                    )}
                    {cell?.source === 'ADMIN_AT_CLOSE' && (
                      <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        style={[styles.cellNote, styles.center]}
                      >
                        Entered at close
                      </ThemedText>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          <View
            style={[
              styles.row,
              styles.rowDivider,
              border,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <View style={[styles.cell, styles.subjectCell]}>
              <ThemedText type="smallBold">Overall</ThemedText>
            </View>
            {columns.map((column) => (
              <View
                key={column.key}
                style={[
                  styles.cell,
                  { width: COLUMN_WIDTH[column.kind], backgroundColor: tint(column.kind) },
                ]}
              >
                <ThemedText type="smallBold">{formatScore(overall[column.key])}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Attendance({ attendance }: { attendance: ReportCardPayload['attendance'] }) {
  const theme = useTheme();
  const tiles: [string, number][] = [
    ['Present', attendance.present],
    ['Absent', attendance.absent],
    ['Late', attendance.late],
    ['Excused', attendance.excused],
    ['Sick', attendance.sick],
    ['Carried', attendance.carriedDays],
  ];
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">Attendance (days)</ThemedText>
      <View style={styles.tileGrid}>
        {tiles.map(([label, value]) => (
          <View
            key={label}
            style={[styles.tile, { backgroundColor: theme.backgroundElement }]}
            accessible
            accessibilityLabel={`${label}: ${value} days`}
          >
            <ThemedText type="small" themeColor="textSecondary">
              {label}
            </ThemedText>
            <ThemedText type="smallBold" style={styles.tileValue}>
              {value}
            </ThemedText>
          </View>
        ))}
      </View>
      {attendance.carriedDays > 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          Includes {attendance.carriedDays} days carried from a previous school.
        </ThemedText>
      )}
    </View>
  );
}

export type ReportCardViewProps = {
  payload: ReportCardPayload;
  version?: number;
  status?: ReportCard['status'];
};

/**
 * The report card exactly as the school issued it — the same layout and
 * wording as the web SIS `ReportCardView`: school and principal, student
 * facts, the subject × period/term/yearly grid with an Overall row,
 * attendance, marks from a previous school, the end-of-year outcome and
 * principal's remark (final cards), and the pass mark.
 *
 * Pure display: the server already computed every average, so nothing is
 * recalculated here (the older `ReportCardTable` did, for servers that only
 * send the simplified grid).
 */
export function ReportCardView({ payload, version, status }: ReportCardViewProps) {
  const theme = useTheme();

  if (payload.schemaVersion !== 1) {
    return (
      <View style={[styles.card, { borderColor: theme.backgroundSelected }]}>
        <ThemedText type="small">
          This report card uses a newer format. Update the app to view it.
        </ThemedText>
      </View>
    );
  }

  const { student, school } = payload;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.background, borderColor: theme.backgroundSelected },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <ThemedText type="subtitle" style={styles.schoolName}>
            {school.name}
          </ThemedText>
          {school.principalName && (
            <ThemedText type="small" themeColor="textSecondary">
              Principal: {school.principalName}
            </ThemedText>
          )}
        </View>
        <View style={styles.badges}>
          {status === 'WITHDRAWN' && <Badge label="Withdrawn" tone="error" />}
          {status === 'SUPERSEDED' && <Badge label="Replaced by a newer version" tone="warning" />}
          {version !== undefined && <Badge label={`Version ${version}`} />}
        </View>
      </View>

      <View style={styles.facts}>
        <Fact label="Student">
          <ThemedText type="smallBold">{studentFullName(student)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            NEMIS ID:{' '}
            <ThemedText type="small" themeColor="textSecondary" style={styles.mono}>
              {formatNemisIdInput(student.nemisId)}
            </ThemedText>
          </ThemedText>
        </Fact>
        <Fact label="Class">
          <ThemedText type="small">{payload.class.name}</ThemedText>
        </Fact>
        <Fact label="Grade">
          <ThemedText type="small">{formatGradeLevel(payload.class.gradeLevel)}</ThemedText>
        </Fact>
        <Fact label="Academic year">
          <ThemedText type="small">{payload.academicYear.name}</ThemedText>
        </Fact>
        <Fact label="Report">
          <ThemedText type="small">{reportKindLabel(payload)}</ThemedText>
        </Fact>
      </View>

      <ScoreTable payload={payload} />

      <Attendance attendance={payload.attendance} />

      {priorRecordBySchool(payload.priorSchoolRecord).map(([schoolName, rows]) => (
        <View key={schoolName} style={styles.section}>
          <ThemedText type="smallBold">Earned at {schoolName}</ThemedText>
          {rows.map((row, index) => (
            <View
              key={`${row.subjectName}-${row.periodLabel}-${index}`}
              style={[styles.priorRow, { borderColor: theme.backgroundSelected }]}
            >
              <ThemedText type="small" style={styles.flex}>
                {row.subjectName}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
                {row.periodLabel}
              </ThemedText>
              <ThemedText type="smallBold">{row.value}</ThemedText>
            </View>
          ))}
        </View>
      ))}

      {payload.kind === 'FINAL' && (payload.outcome || payload.principalRemark) && (
        <View style={styles.section}>
          {payload.outcome && (
            <ThemedText type="smallBold" style={styles.outcome}>
              {outcomeText(payload.outcome, payload.class.gradeLevel)}
            </ThemedText>
          )}
          {payload.principalRemark && (
            <View>
              <ThemedText type="smallBold">Principal&apos;s remark</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {payload.principalRemark}
              </ThemedText>
            </View>
          )}
        </View>
      )}

      <ThemedText type="small" themeColor="textSecondary">
        Pass mark: {payload.passMark}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  schoolName: {
    fontSize: 18,
    lineHeight: 24,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  fact: {
    width: '50%',
    paddingRight: 8,
  },
  factLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  mono: {
    fontFamily: Fonts?.mono,
  },
  tableWrap: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectCell: {
    width: SUBJECT_WIDTH,
    alignItems: 'flex-start',
    paddingLeft: 12,
  },
  headerText: {
    fontSize: 10,
    lineHeight: 13,
  },
  center: {
    textAlign: 'center',
  },
  cellNote: {
    fontSize: 10,
    lineHeight: 12,
  },
  section: {
    gap: 8,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '30%',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tileValue: {
    fontSize: 16,
  },
  priorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  outcome: {
    fontSize: 16,
  },
});
