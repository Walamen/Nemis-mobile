import { Switch } from 'react-native';

import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { View } from '@/tw';

type PreferenceRow = {
  id: string;
  label: string;
  description: string;
  icon?: IconProps['name'];
  /** What actually happens today — the switch shows this, disabled. */
  isOn: boolean;
};

type PreferenceSection = { title: string; rows: PreferenceRow[] };

const SECTIONS: PreferenceSection[] = [
  {
    title: 'School communication',
    rows: [
      {
        id: 'messages',
        label: 'Messages from teachers',
        description: 'New replies in your Inbox',
        icon: { ios: 'bubble.left', android: 'chat_bubble_outline', web: 'chat_bubble_outline' },
        isOn: true,
      },
      {
        id: 'announcements',
        label: 'School announcements',
        description: 'Events, meetings and holidays',
        icon: { ios: 'megaphone', android: 'campaign', web: 'campaign' },
        isOn: true,
      },
    ],
  },
  {
    title: 'Academics',
    rows: [
      {
        id: 'grades',
        label: 'New marks and report cards',
        description: 'When a teacher enters a mark or a report is published',
        icon: { ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' },
        isOn: true,
      },
      {
        id: 'attendance',
        label: 'Attendance alerts',
        description: 'Absences and late arrivals',
        icon: { ios: 'checkmark.circle', android: 'event_available', web: 'event_available' },
        isOn: true,
      },
      {
        id: 'assignments',
        label: 'Assignments',
        description: 'New work set by teachers',
        icon: { ios: 'checklist', android: 'checklist', web: 'checklist' },
        isOn: true,
      },
    ],
  },
  {
    title: 'Finance',
    rows: [
      {
        id: 'fees',
        label: 'Fee reminders',
        description: 'When a new fee is billed',
        icon: { ios: 'creditcard', android: 'credit_card', web: 'credit_card' },
        isOn: true,
      },
      {
        id: 'receipts',
        label: 'Payment receipts',
        description: 'Not sent yet — payments show in Fees',
        icon: { ios: 'doc.text', android: 'receipt_long', web: 'receipt_long' },
        isOn: false,
      },
    ],
  },
  {
    title: 'How you are notified',
    rows: [
      {
        id: 'in-app',
        label: 'In the app',
        description: 'Notifications and Inbox, whenever you open NEMIS',
        isOn: true,
      },
      { id: 'push', label: 'Push notifications', description: 'Not available yet', isOn: false },
      { id: 'sms', label: 'SMS', description: 'Not available yet', isOn: false },
      { id: 'email', label: 'Email', description: 'Not available yet', isOn: false },
    ],
  },
];

function Row({ row, isLast }: { row: PreferenceRow; isLast: boolean }) {
  const theme = useTheme();
  return (
    <View
      className="flex-row items-center gap-3 px-4 py-3"
      style={isLast ? undefined : { borderBottomWidth: 1, borderColor: theme.backgroundSelected }}
    >
      {row.icon && (
        <View
          className="h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: theme.background }}
        >
          <Icon name={row.icon} size="sm" color={Palette.accent} />
        </View>
      )}
      <View className="flex-1">
        <ThemedText type="smallBold">{row.label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {row.description}
        </ThemedText>
      </View>
      <Switch
        value={row.isOn}
        disabled
        trackColor={{ true: Palette.accent, false: theme.backgroundSelected }}
        thumbColor="#FFFFFF"
        accessibilityLabel={`${row.label}: ${row.isOn ? 'on' : 'off'}. Can't be changed yet.`}
      />
    </View>
  );
}

/**
 * Notification preferences body — shared by the student
 * (`(student)/settings/notification-preferences`) and parent
 * (`(parent)/profile/notification-preferences`) screens, in the Notification
 * preferences design's grouped layout.
 *
 * Read-only for now: the server has no notification-preferences endpoint for
 * students or parents and sends no push, SMS or email — so the switches show
 * what actually happens today, disabled, instead of pretending to save. The
 * design's "Quiet hours" and "Changes are saved automatically" are left out
 * until there's something for them to control. Make the switches interactive
 * once the backend stores preferences.
 */
export function NotificationPreferencesContent() {
  const theme = useTheme();

  return (
    <View className="pb-6">
      <ThemedText type="small" themeColor="textSecondary">
        These are the alerts NEMIS sends you today. Choosing which ones you get is coming soon — for
        now every school alert appears in your Notifications and Inbox.
      </ThemedText>

      {SECTIONS.map((section) => (
        <View key={section.title}>
          <ThemedText type="smallBold" themeColor="textSecondary" className="mb-2 mt-5 uppercase">
            {section.title}
          </ThemedText>
          <View className="overflow-hidden rounded-card" style={{ backgroundColor: theme.card }}>
            {section.rows.map((row, index) => (
              <Row key={row.id} row={row} isLast={index === section.rows.length - 1} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
