import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationPreferencesContent } from '@/components/settings/notification-preferences-content';

export default function NotificationPreferencesScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <NotificationPreferencesContent />
      </ScrollView>
    </SafeAreaView>
  );
}
