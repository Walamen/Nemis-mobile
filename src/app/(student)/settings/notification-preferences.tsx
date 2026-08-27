import { ScrollView } from 'react-native';

import { NotificationPreferencesContent } from '@/components/settings/notification-preferences-content';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';

export default function NotificationPreferencesScreen() {
  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Notification Preferences" />
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <NotificationPreferencesContent />
      </ScrollView>
    </AppScreen>
  );
}
