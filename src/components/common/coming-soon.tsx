import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { View } from '@/tw';

/**
 * Placeholder screen for a parent feature that isn't built yet. Uses
 * `AppScreen` + `AppHeader` like every other screen: the previous version
 * put `className="flex-1"` on `react-native-safe-area-context`'s
 * `SafeAreaView`, which ignores `className` (see `AppScreen`), so it had no
 * height or padding, and with stack headers hidden it had no way back.
 */
export function ComingSoon({ title }: { title: string }) {
  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title={title} titleAlign="left" />
      <View className="flex-1 items-center justify-center gap-2 px-6">
        <ThemedText type="sectionHeading" className="text-center">
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" className="text-center">
          This is coming soon.
        </ThemedText>
      </View>
    </AppScreen>
  );
}
