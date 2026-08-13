import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeTime } from '@/utils/date';

export type NotificationCardProps = {
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  onPress?: () => void;
  className?: string;
};

export function NotificationCard({
  title,
  message,
  createdAt,
  isRead,
  onPress,
  className,
}: NotificationCardProps) {
  const theme = useTheme();

  return (
    <Card
      onPress={onPress}
      backgroundColor={isRead ? theme.backgroundElement : theme.backgroundSelected}
      className={className}
    >
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {message}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatRelativeTime(createdAt)}
      </ThemedText>
    </Card>
  );
}
