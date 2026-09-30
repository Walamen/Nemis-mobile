import { Switch } from 'react-native';

import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { View } from '@/tw';

type Category = {
  id: string;
  label: string;
  description: string;
};

const CATEGORIES: Category[] = [
  {
    id: 'attendance',
    label: 'Attendance updates',
    description: 'Absences, lateness and excused days.',
  },
  {
    id: 'grades',
    label: 'Grades & report cards',
    description: 'New marks and published report cards.',
  },
  {
    id: 'fees',
    label: 'Fee reminders',
    description: 'Upcoming due dates and payment confirmations.',
  },
  { id: 'assignments', label: 'Assignments', description: 'New assignments and grading updates.' },
  {
    id: 'messages',
    label: 'Announcements & messages',
    description: 'School announcements and teacher messages.',
  },
];

/**
 * Notification preferences body — shared by the student
 * (`(student)/settings/notification-preferences`) and parent
 * (`(parent)/profile/notification-preferences`) screens.
 *
 * Read-only "Coming soon": there's no notification-preferences endpoint and
 * the app doesn't send push notifications yet, so interactive toggles would
 * pretend to save something they can't. The switches show today's actual
 * behavior (every category on) and are disabled. Make them interactive once
 * the backend has somewhere to store preferences.
 */
export function NotificationPreferencesContent() {
  const theme = useTheme();

  return (
    <View className="gap-2 pb-6">
      <Card backgroundColor={theme.card} className="gap-1 border-l-4 border-secondary">
        <ThemedText type="smallBold">Coming soon</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          You can&apos;t change these yet. For now you receive every category below in your
          Notifications and Inbox.
        </ThemedText>
      </Card>

      <View className="mt-2 gap-2">
        {CATEGORIES.map((category) => (
          <Card
            key={category.id}
            backgroundColor={theme.card}
            className="flex-row items-center gap-3"
          >
            <View className="flex-1">
              <ThemedText type="smallBold">{category.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {category.description}
              </ThemedText>
            </View>
            <Switch
              value
              disabled
              trackColor={{ true: Palette.secondary, false: theme.backgroundSelected }}
              thumbColor="#FFFFFF"
              accessibilityLabel={`${category.label}: on. Not adjustable yet.`}
            />
          </Card>
        ))}
      </View>
    </View>
  );
}
