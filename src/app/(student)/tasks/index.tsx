import type { Href } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useGetAssignmentsQuery } from '@/api/tasks/assignments-api';
import { useGetResourcesQuery } from '@/api/tasks/resources-api';
import { HubCard } from '@/components/cards/hub-card';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { CardBackgroundColor, Palette } from '@/theme';
import { formatDueLabel } from '@/utils/date';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Tasks hub — matches the "NEMIS Mobile" Claude Design case study's hub
 * shape (`HubCard`, shared with the Academics hubs). Stats are computed
 * from real, already-fetched assignment/resource data. See
 * docs/PRODUCT_DECISIONS.md.
 */
export default function TasksMenuScreen() {
  const { data: assignments } = useGetAssignmentsQuery();
  const { data: resources } = useGetResourcesQuery();

  const { pending, dueThisWeek, overdue, submitted, nextDue } = useMemo(() => {
    const now = new Date().getTime();
    const pending = assignments?.filter((a) => !a.mySubmission) ?? [];
    const dueThisWeek = pending.filter((a) => new Date(a.dueDate).getTime() - now <= WEEK_MS);
    const overdue = pending.filter((a) => new Date(a.dueDate).getTime() < now);
    const submitted = assignments?.filter((a) => a.mySubmission) ?? [];
    const nextDue = [...pending].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )[0];
    return { pending, dueThisWeek, overdue, submitted, nextDue };
  }, [assignments]);

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Tasks" showBack={false} />
      {/* Plain RN `ScrollView`, not `@/tw`'s — see `AppScreen`'s comment for
          why `className="flex-1"` silently fails to apply there. */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }}>
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
          description="What's due, submitted, and graded across your subjects."
          href={'/tasks/assignments' as Href}
          badge={pending.length > 0 ? `${pending.length} due` : undefined}
          backgroundColor={CardBackgroundColor}
          stats={
            assignments ? [`${pending.length} due`, `${submitted.length} submitted`] : undefined
          }
        />

        <HubCard
          icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
          title="Resources"
          description="Notes, past papers, and other materials your teachers share."
          href={'/tasks/resources' as Href}
          backgroundColor={CardBackgroundColor}
          stats={resources ? [`${resources.length} shared`] : undefined}
          showImage
        />

        {nextDue && (
          <ThemedView style={[styles.alert, { backgroundColor: CardBackgroundColor }]}>
            <ThemedText type="smallBold">{nextDue.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {nextDue.subjectName ?? nextDue.className} · {formatDueLabel(nextDue.dueDate)}
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </AppScreen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <ThemedView style={[styles.stat, { backgroundColor: CardBackgroundColor }]}>
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
