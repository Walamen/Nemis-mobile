import { ScrollPage } from '@/components/layout/scroll-page';
import { NotificationPreferencesContent } from '@/components/settings/notification-preferences-content';

/** Notification preferences — shared content, same screen in both apps. */
export default function NotificationPreferencesScreen() {
  return (
    <ScrollPage title="Notification preferences" titleAlign="left">
      <NotificationPreferencesContent />
    </ScrollPage>
  );
}
