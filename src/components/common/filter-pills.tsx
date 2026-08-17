import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';

export type FilterPillsProps<T extends string> = {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
};

/** Horizontal pill selector — status/category/term filters, day pickers.
 * The pill-row pattern repeated across `tasks/assignments.tsx`,
 * `tasks/resources.tsx`, and other filtered list screens. */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  className,
}: FilterPillsProps<T>) {
  const theme = useTheme();

  return (
    <View style={styles.row} className={className}>
      {options.map((option) => {
        const isSelected = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <ThemedText type="smallBold">{option.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
