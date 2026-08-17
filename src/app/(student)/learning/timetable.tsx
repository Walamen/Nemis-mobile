import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useGetMyTimetableQuery } from '@/api/timetable/timetable-api';
import { Card } from '@/components/common/card';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { TIMETABLE_DAYS } from '@/types/timetable';
import { Pressable } from '@/tw';

function todaysDay(): (typeof TIMETABLE_DAYS)[number] | null {
  // getDay(): 0=Sunday..6=Saturday; TIMETABLE_DAYS is Monday-first weekdays only.
  const index = new Date().getDay() - 1;
  return index >= 0 && index < TIMETABLE_DAYS.length ? TIMETABLE_DAYS[index]! : null;
}

export default function TimetableScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetMyTimetableQuery();
  const theme = useTheme();
  const scheduledDays = TIMETABLE_DAYS.filter((day) => (data?.[day]?.length ?? 0) > 0);
  const [selectedDay, setSelectedDay] = useState<(typeof TIMETABLE_DAYS)[number] | null>(null);

  const today = todaysDay();
  const activeDay =
    (selectedDay && scheduledDays.includes(selectedDay) ? selectedDay : null) ??
    (today && scheduledDays.includes(today) ? today : null) ??
    scheduledDays[0] ??
    null;
  const periods = activeDay ? (data?.[activeDay] ?? []) : [];

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Timetable" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={scheduledDays.length === 0}
        emptyMessage="No timetable entries yet."
        onRetry={refetch}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <View style={styles.dayRow}>
            {scheduledDays.map((day) => {
              const isSelected = day === activeDay;
              return (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={[
                    styles.dayPill,
                    {
                      backgroundColor: isSelected
                        ? theme.backgroundSelected
                        : theme.backgroundElement,
                    },
                  ]}
                >
                  <ThemedText type="smallBold">{day.slice(0, 3)}</ThemedText>
                </Pressable>
              );
            })}
          </View>

          {activeDay && (
            <Card className="mb-4">
              <ThemedText type="small" themeColor="textSecondary">
                {activeDay}
              </ThemedText>
              <ThemedText type="smallBold">
                {periods.length} period{periods.length === 1 ? '' : 's'}
              </ThemedText>
            </Card>
          )}

          <View style={styles.periodList}>
            {periods.map((entry) => (
              <View key={entry.id} style={styles.periodRow}>
                <View style={styles.timeCol}>
                  <ThemedText type="smallBold">{entry.startTime}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {entry.endTime}
                  </ThemedText>
                </View>
                <Card className="flex-1 flex-row items-center gap-3">
                  <View style={styles.rule} />
                  <View className="flex-1">
                    <ThemedText type="smallBold">{entry.subject?.name ?? 'Free period'}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {entry.teacher ? `${entry.teacher.firstName} ${entry.teacher.lastName}` : ''}
                      {entry.room ? ` · Room ${entry.room}` : ''}
                    </ThemedText>
                  </View>
                </Card>
              </View>
            ))}
          </View>
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  dayRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dayPill: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  periodList: {
    gap: 8,
    paddingBottom: 16,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  timeCol: {
    width: 56,
    alignItems: 'flex-end',
    paddingTop: 16,
  },
  rule: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 9999,
    backgroundColor: Palette.secondary,
  },
});
