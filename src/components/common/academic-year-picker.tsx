import { ScrollView } from 'react-native';

import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { ReportCardYear } from '@/types/grades';
import { Pressable, View } from '@/tw';
import { reportCardYearLabel } from '@/utils/report-card';

const CLOSED_YEAR_NOTICE = 'You are viewing a closed year. These records are final.';

function isClosed(status: ReportCardYear['yearStatus'] | undefined): boolean {
  return status === 'CLOSED' || status === 'REOPENED';
}

/**
 * Report card year picker — one chip per year the student holds a card for,
 * like the web SIS `AcademicYearPicker`. Hidden with fewer than two years
 * (nothing to choose), but the closed-year notice still shows when the card
 * on screen is from a closed year.
 */
export function AcademicYearPicker({
  years,
  value,
  onChange,
}: {
  years: ReportCardYear[];
  /** The year on screen. */
  value: string | undefined;
  onChange: (academicYearId: string) => void;
}) {
  const theme = useTheme();
  const selected = years.find((year) => year.academicYearId === value);

  return (
    <View className="gap-2">
      {years.length >= 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginHorizontal: -4 }}
          accessibilityRole="tablist"
          accessibilityLabel="Academic year"
        >
          {years.map((year) => {
            const isSelected = year.academicYearId === value;
            return (
              <Pressable
                // A transferred child can hold two cards for one year (one per school).
                key={`${year.academicYearId}-${year.schoolName}`}
                className="mx-1 flex-row items-center gap-2 rounded-full px-4 py-2"
                style={{
                  backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement,
                }}
                onPress={() => onChange(year.academicYearId)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={reportCardYearLabel(year)}
              >
                <ThemedText type="smallBold">{year.academicYearName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {year.className}
                </ThemedText>
                {isClosed(year.yearStatus) && (
                  <ThemedText type="small" themeColor="textSecondary">
                    · {year.yearStatus === 'REOPENED' ? 'Reopened' : 'Closed'}
                  </ThemedText>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      {selected && isClosed(selected.yearStatus) && (
        <View
          className="rounded-card px-3 py-2"
          style={{ backgroundColor: theme.backgroundElement }}
          accessibilityRole="text"
        >
          <ThemedText type="small" themeColor="textSecondary">
            {CLOSED_YEAR_NOTICE}
          </ThemedText>
        </View>
      )}
    </View>
  );
}
