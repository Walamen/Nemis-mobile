import { ScrollView } from 'react-native';

import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';

/** Horizontal child picker. Renders nothing for single-child parents. */
export function ChildSwitcher() {
  const { children, selectedChildId, setSelectedChildId } = useSelectedChild();
  const theme = useTheme();

  if (children.length <= 1) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-1">
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
          >
            <ThemedText type="smallBold">{child.firstName}</ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
