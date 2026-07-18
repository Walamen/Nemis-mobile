import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export function ComingSoon({ title }: { title: string }) {
  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 items-center justify-center gap-2 px-6">
        <ThemedText type="title" className="text-center">
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" className="text-center">
          This is coming soon.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}
