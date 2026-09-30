import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { View } from '@/tw';
import { formatRelativeTime } from '@/utils/date';

export type NotificationCardProps = {
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  onPress?: () => void;
  /** Whether tapping opens a related screen (announced to screen readers). */
  opensDetail?: boolean;
  className?: string;
};

/**
 * Unread is carried by an accent bar, a dot, and a bold title rather than a
 * background tint alone — the previous read/unread surfaces (`#DEDCDC` vs
 * `#E0E1E6`) were nearly indistinguishable.
 */
export function NotificationCard({
  title,
  message,
  createdAt,
  isRead,
  onPress,
  opensDetail,
  className = '',
}: NotificationCardProps) {
  const theme = useTheme();
  const time = formatRelativeTime(createdAt);

  return (
    <Card
      onPress={onPress}
      backgroundColor={theme.card}
      className={`border-l-4 ${isRead ? 'border-transparent' : 'border-accent'} ${className}`}
      accessibilityLabel={`${isRead ? '' : 'Unread. '}${title}. ${message}. ${time}`}
      accessibilityHint={opensDetail ? 'Opens the related screen' : undefined}
    >
      <View className="flex-row items-center gap-2">
        {!isRead && (
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: Palette.accent }} />
        )}
        <ThemedText type={isRead ? 'small' : 'smallBold'} className="flex-1">
          {title}
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {message}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {time}
      </ThemedText>
    </Card>
  );
}
