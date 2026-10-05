import { ScrollPage } from '@/components/layout/scroll-page';
import { NotificationPreferencesContent } from '@/components/settings/notification-preferences-content';

export default function NotificationPreferencesScreen() {
  return (
    <ScrollPage title="Notification preferences">
      <NotificationPreferencesContent />
    </ScrollPage>
  );
}
