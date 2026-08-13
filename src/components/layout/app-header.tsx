import { useRouter } from 'expo-router';

import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { Palette } from '@/theme';
import { Pressable, Text, View } from '@/tw';

export type AppHeaderAction = {
  icon: IconProps['name'];
  onPress: () => void;
  accessibilityLabel: string;
  /** Small unread-count badge on the icon's corner. */
  badge?: number;
};

export type AppHeaderProps = {
  title?: string;
  /** Defaults to `router.canGoBack()` — override to force show/hide, e.g.
   * `false` on a tab's root screen even if the stack has history. */
  showBack?: boolean;
  /** Trailing icon buttons — e.g. a notifications bell with an unread
   * count, or a search trigger — rendered right-aligned in order. Only the
   * capability exists so far; no screen has a real need for one yet. */
  actions?: AppHeaderAction[];
  className?: string;
};

const BACK_ICON: IconProps['name'] = {
  ios: 'chevron.left',
  android: 'arrow_back',
  web: 'arrow_back',
};

/**
 * Standard screen header: back button (auto-hidden on a stack's root
 * screen unless overridden) + centered title + optional trailing action
 * icons. Meant to replace the native Stack header on screens that opt in —
 * pair with `headerShown: false` on the enclosing `Stack`'s
 * `screenOptions`, and render as the first child inside `AppScreen`,
 * before any scrollable content, so it doesn't scroll away. Relies on
 * `AppScreen`'s `SafeAreaView` for the top safe-area inset — doesn't
 * apply its own.
 */
export function AppHeader({ title, showBack, actions = [], className = '' }: AppHeaderProps) {
  const router = useRouter();
  const canGoBack = showBack ?? router.canGoBack();

  return (
    <View className={`h-14 flex-row items-center px-2 ${className}`}>
      <View className="w-10">
        {canGoBack && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityLabel="Back"
            className="h-10 w-10 items-center justify-center"
          >
            <Icon name={BACK_ICON} />
          </Pressable>
        )}
      </View>
      <ThemedText type="sectionHeading" className="flex-1 text-center" numberOfLines={1}>
        {title}
      </ThemedText>
      <View className="flex-row items-center justify-end" style={{ minWidth: 40 }}>
        {actions.map((action) => (
          <Pressable
            key={action.accessibilityLabel}
            onPress={action.onPress}
            hitSlop={8}
            accessibilityLabel={action.accessibilityLabel}
            className="h-10 w-10 items-center justify-center"
          >
            <Icon name={action.icon} />
            {!!action.badge && (
              <View
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  paddingHorizontal: 3,
                  backgroundColor: Palette.error,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '700' }}>
                  {action.badge}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
