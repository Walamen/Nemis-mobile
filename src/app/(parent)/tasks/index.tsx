import type { Href } from 'expo-router';
import { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useGetChildAssignmentsQuery } from '@/api/parent/assignments-api';
import { useGetParentResourcesQuery } from '@/api/parent/resources-api';
import { HubCard } from '@/components/cards/hub-card';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { SectionState } from '@/components/common/section-state';
import { ThemedView } from '@/components/common/themed-view';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { formatDueLabel } from '@/utils/date';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Tasks hub — the Student Tasks hub's shape (stats row + `HubCard`s on the
 * themed card surface) for the selected child. Hub cards render
 * immediately; only the stats section shows loading/error/empty.
 */
export default function TasksMenuScreen() {
  const theme = useTheme();
  const { selectedChildId, refetch: refetchChildren } = useSelectedChild();
  const assignmentsQuery = useGetChildAssignmentsQuery(selectedChildId ?? '', {
    skip: !selectedChildId,
  });
  const resourcesQuery = useGetParentResourcesQuery();
  const { data: assignments, fulfilledTimeStamp } = assignmentsQuery;
  const { data: resources } = resourcesQuery;

  // Due/overdue are judged as of when the data was fetched (pure render);
  // "due this week" excludes overdue, matching the Student hub.
  const stats = useMemo(() => {
    if (!assignments || fulfilledTimeStamp == null) return undefined;
    const now = fulfilledTimeStamp;
    const pending = assignments.filter((a) => a.status === 'PENDING' || a.status === 'MISSING');
    const dueOf = (a: (typeof assignments)[number]) => new Date(a.dueDate).getTime();
    return {
      pending: pending.length,
      dueThisWeek: pending.filter((a) => dueOf(a) >= now && dueOf(a) - now <= WEEK_MS).length,
      overdue: pending.filter((a) => dueOf(a) < now).length,
      submitted: assignments.filter((a) => ['SUBMITTED', 'GRADED', 'LATE'].includes(a.status))
        .length,
      nextDue: [...pending].sort((a, b) => dueOf(a) - dueOf(b))[0],
    };
  }, [assignments, fulfilledTimeStamp]);

  const isRefreshing = assignmentsQuery.isFetching || resourcesQuery.isFetching;
  function refreshAll() {
    refetchChildren();
    resourcesQuery.refetch();
    if (selectedChildId) assignmentsQuery.refetch();
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Tasks" showBack={false} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
      >
        <ChildSwitcher />

        <SectionState
          isLoading={assignmentsQuery.isLoading}
          isError={assignmentsQuery.isError && !assignments}
          error={assignmentsQuery.error}
          isEmpty={assignments?.length === 0}
          emptyMessage="No assignments for this child yet."
        >
          {stats && (
            <View style={styles.statRow}>
              <Stat label="Due this week" value={stats.dueThisWeek} />
              <Stat label="Submitted" value={stats.submitted} />
              <Stat label="Overdue" value={stats.overdue} />
            </View>
          )}
        </SectionState>

        <HubCard
          icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
          title="Assignments"
          description="What's due, submitted, and graded for this child."
          href={'/tasks/assignments' as Href}
          backgroundColor={theme.card}
          badge={stats && stats.pending > 0 ? `${stats.pending} due` : undefined}
          stats={stats ? [`${stats.pending} due`, `${stats.submitted} submitted`] : undefined}
        />

        <HubCard
          icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
          title="Resources"
          description="Textbooks, past papers, and notes shared by the school."
          href={'/tasks/resources' as Href}
          backgroundColor={theme.card}
          stats={resources ? [`${resources.length} shared`] : undefined}
          showImage
        />

        {stats?.nextDue && (
          <ThemedView style={[styles.alert, { backgroundColor: theme.card }]}>
            <ThemedText type="smallBold">{stats.nextDue.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {stats.nextDue.subject ?? 'General'} · {formatDueLabel(stats.nextDue.dueDate)}
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </AppScreen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  return (
    <ThemedView
      style={[styles.stat, { backgroundColor: theme.card }]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="subtitle" style={{ fontSize: 20 }}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  alert: {
    gap: 4,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Palette.error,
  },
});
