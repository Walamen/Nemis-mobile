import type { Href } from 'expo-router';
import { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useGetAssignmentsQuery } from '@/api/tasks/assignments-api';
import { useGetResourcesQuery } from '@/api/tasks/resources-api';
import { HubCard } from '@/components/cards/hub-card';
import { SectionState } from '@/components/common/section-state';
import { ThemedView } from '@/components/common/themed-view';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import {
  getNextDue,
  isAwaitingSubmission,
  isDueThisWeek,
  isOverdue,
  isTurnedIn,
} from '@/utils/assignments';
import { formatDueLabel } from '@/utils/date';

/**
 * Tasks hub — matches the "NEMIS Mobile" Claude Design case study's hub
 * shape (`HubCard`, shared with the Academics hubs). Stats are computed
 * from real, already-fetched assignment/resource data using the same status
 * rules as the Assignments screen (`@/utils/assignments`). Hub cards render
 * regardless of data state (docs/UI_PATTERNS.md §6); only the stats section
 * shows loading/error.
 */
export default function TasksMenuScreen() {
  const theme = useTheme();
  const assignmentsQuery = useGetAssignmentsQuery();
  const resourcesQuery = useGetResourcesQuery();
  const { data: assignments, fulfilledTimeStamp } = assignmentsQuery;
  const { data: resources } = resourcesQuery;

  // Due/overdue are judged as of when the data was fetched — render stays
  // pure, and every refetch (pull-to-refresh, app foreground) updates it.
  const stats = useMemo(() => {
    if (!assignments || fulfilledTimeStamp == null) return undefined;
    const now = fulfilledTimeStamp;
    return {
      awaiting: assignments.filter(isAwaitingSubmission).length,
      dueThisWeek: assignments.filter((a) => isDueThisWeek(a, now)).length,
      overdue: assignments.filter((a) => isOverdue(a, now)).length,
      turnedIn: assignments.filter(isTurnedIn).length,
      nextDue: getNextDue(assignments),
    };
  }, [assignments, fulfilledTimeStamp]);

  const isRefreshing = assignmentsQuery.isFetching || resourcesQuery.isFetching;
  function refetch() {
    assignmentsQuery.refetch();
    resourcesQuery.refetch();
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Tasks" showBack={false} />
      {/* Plain RN `ScrollView`, not `@/tw`'s — see `AppScreen`'s comment for
          why `className="flex-1"` silently fails to apply there. */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing && !assignmentsQuery.isLoading}
            onRefresh={refetch}
          />
        }
      >
        <SectionState
          isLoading={assignmentsQuery.isLoading}
          isError={assignmentsQuery.isError && !assignments}
          error={assignmentsQuery.error}
          isEmpty={assignments?.length === 0}
          emptyMessage="No assignments yet — you're all caught up."
        >
          {stats && (
            <View style={styles.statRow}>
              <Stat label="Due this week" value={stats.dueThisWeek} />
              <Stat label="Submitted" value={stats.turnedIn} />
              <Stat label="Overdue" value={stats.overdue} />
            </View>
          )}
        </SectionState>

        <HubCard
          icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
          title="Assignments"
          description="What's due, submitted, and graded across your subjects."
          href={'/tasks/assignments' as Href}
          badge={stats && stats.awaiting > 0 ? `${stats.awaiting} due` : undefined}
          backgroundColor={theme.card}
          stats={stats ? [`${stats.awaiting} due`, `${stats.turnedIn} submitted`] : undefined}
        />

        <HubCard
          icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
          title="Resources"
          description="Notes, past papers, and other materials your teachers share."
          href={'/tasks/resources' as Href}
          backgroundColor={theme.card}
          stats={resources ? [`${resources.length} shared`] : undefined}
          showImage
        />

        {stats?.nextDue && (
          <ThemedView style={[styles.alert, { backgroundColor: theme.card }]}>
            <ThemedText type="smallBold">{stats.nextDue.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {stats.nextDue.subjectName ?? stats.nextDue.className} ·{' '}
              {formatDueLabel(stats.nextDue.dueDate)}
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
