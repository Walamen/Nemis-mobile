import { ScrollView } from 'react-native';

import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';

/**
 * Horizontal child picker. Renders nothing for single-child parents.
 *
 * `inset` is for screens that place it above their loading/empty/error
 * area (outside the scrolling content, which normally supplies the 16px
 * gutter) — so the switcher stays reachable when the selected child has no
 * records or their request fails.
 */
export function ChildSwitcher({ inset = false }: { inset?: boolean }) {
  const { children, selectedChildId, setSelectedChildId } = useSelectedChild();
  const theme = useTheme();

  if (children.length <= 1) return null;

  return (
    // `style`, not `className` — React Native's own `ScrollView` ignores
    // `className`, so the spacing never applied.
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        flexGrow: 0,
        marginBottom: inset ? 8 : 16,
        marginTop: inset ? 8 : 0,
        marginHorizontal: inset ? 12 : -4,
      }}
      accessibilityRole="tablist"
    >
      {children.map((child) => {
        const isSelected = child.id === selectedChildId;
        return (
          <Pressable
            key={child.id}
            className="mx-1 rounded-full px-4 py-2"
            style={{
              backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement,
            }}
            onPress={() => setSelectedChildId(child.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${child.firstName} ${child.lastName}`}
          >
            <ThemedText type="smallBold">{child.firstName}</ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
