import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/buttons/button';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useAuth } from '@/hooks/use-auth';

export default function ParentDashboardScreen() {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 justify-center gap-4 px-6">
        <ThemedText type="title" className="text-center">
          Welcome, {user?.firstName}
        </ThemedText>
        <ThemedText themeColor="textSecondary" className="text-center">
          Your parent dashboard is on the way.
        </ThemedText>
        <Button label="Log out" onPress={() => logout()} isLoading={isLoggingOut} />
      </SafeAreaView>
    </ThemedView>
  );
}
