import { useState } from 'react';
import { Switch } from 'react-native';

import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { CardBackgroundColor, Palette } from '@/theme';
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

const DEFAULT_STATE: Record<string, boolean> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, true]),
);

/**
 * Notification preferences body — shared by the student
 * (`(student)/settings/notification-preferences`) and parent
 * (`(parent)/profile/notification-preferences`) screens.
 *
 * Local state only: there's no notification-preferences endpoint yet (see
 * docs/API_MAPPING.md), so these toggles aren't persisted or wired to what
 * actually gets pushed. Same "visually real, not backend-wired yet"
 * treatment as `AuthHeader`'s decorative search bar — flip this to a real
 * mutation once the backend has somewhere to send these to.
 */
export function NotificationPreferencesContent() {
  const theme = useTheme();
  const [enabled, setEnabled] = useState(DEFAULT_STATE);

  return (
    <View className="gap-2 pb-6">
      <ThemedText type="small" themeColor="textSecondary">
        Choose which updates send you a push notification. You&apos;ll still see everything in your
        Inbox and Notifications regardless of these settings.
      </ThemedText>

      <View className="mt-2 gap-2">
        {CATEGORIES.map((category) => (
          <Card
            key={category.id}
            backgroundColor={CardBackgroundColor}
            className="flex-row items-center gap-3"
          >
            <View className="flex-1">
              <ThemedText type="smallBold">{category.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {category.description}
              </ThemedText>
            </View>
            <Switch
              value={enabled[category.id]}
              onValueChange={(value) => setEnabled((prev) => ({ ...prev, [category.id]: value }))}
              trackColor={{ true: Palette.secondary, false: theme.backgroundSelected }}
              thumbColor="#FFFFFF"
            />
          </Card>
        ))}
      </View>
    </View>
  );
}
