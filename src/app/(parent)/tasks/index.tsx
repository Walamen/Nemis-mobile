import type { Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildAssignmentsQuery } from '@/api/parent/assignments-api';
import { useGetParentResourcesQuery } from '@/api/parent/resources-api';
import { HubCard } from '@/components/cards/hub-card';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { ThemedView } from '@/components/common/themed-view';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { Palette } from '@/theme';
import { formatDueLabel } from '@/utils/date';
import { ScrollView } from '@/tw';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Tasks hub — matches the "NEMIS Mobile" Claude Design case study's hub
 * shape (`HubCard`, shared with the Academics hubs). Stats are computed
 * from real, already-fetched assignment/resource data for the selected
 * child. See docs/PRODUCT_DECISIONS.md.
 */
export default function TasksMenuScreen() {
  const { selectedChildId } = useSelectedChild();
  const { data: assignments } = useGetChildAssignmentsQuery(selectedChildId ?? '', {
    skip: !selectedChildId,
  });
  const { data: resources } = useGetParentResourcesQuery();

  const { pending, dueThisWeek, overdue, submitted, nextDue } = useMemo(() => {
    const now = new Date().getTime();
    const pending = assignments?.filter((a) => a.status === 'PENDING') ?? [];
    const dueThisWeek = pending.filter((a) => new Date(a.dueDate).getTime() - now <= WEEK_MS);
    const overdue = pending.filter((a) => new Date(a.dueDate).getTime() < now);
    const submitted =
      assignments?.filter((a) => ['SUBMITTED', 'GRADED', 'LATE'].includes(a.status)) ?? [];
    const nextDue = [...pending].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )[0];
    return { pending, dueThisWeek, overdue, submitted, nextDue };
  }, [assignments]);

  return (
    <SafeAreaView className="flex-1 gap-2 px-4 pt-4">
      <ChildSwitcher />

      <ScrollView className="flex-1" contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
        {assignments && (
          <View style={styles.statRow}>
            <Stat label="Due this week" value={dueThisWeek.length} />
            <Stat label="Submitted" value={submitted.length} />
            <Stat label="Overdue" value={overdue.length} />
          </View>
        )}

        <HubCard
          icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
          title="Assignments"
          description="What's due, submitted, and graded for this child."
          href={'/tasks/assignments' as Href}
          badge={pending.length > 0 ? `${pending.length} due` : undefined}
          stats={
            assignments ? [`${pending.length} due`, `${submitted.length} submitted`] : undefined
          }
        />

        <HubCard
          icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
          title="Resources"
          description="Textbooks, past papers, and notes shared by the school."
          href={'/tasks/resources' as Href}
          stats={resources ? [`${resources.length} shared`] : undefined}
          showImage
        />

        {nextDue && (
          <ThemedView type="backgroundElement" style={styles.alert}>
            <ThemedText type="smallBold">{nextDue.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {nextDue.subject ?? 'General'} · {formatDueLabel(nextDue.dueDate)}
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <ThemedView type="backgroundElement" style={styles.stat}>
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
