import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import { formatRelativeTime } from '@/utils/date';
import { View } from '@/tw';

export type MessageCardProps = {
  senderName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
  onPress?: () => void;
  className?: string;
};

export function MessageCard({
  senderName,
  lastMessage,
  lastMessageAt,
  unreadCount,
  onPress,
  className,
}: MessageCardProps) {
  return (
    <Card onPress={onPress} className={className}>
      <View className="flex-row items-center justify-between">
        <ThemedText type="smallBold">{senderName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatRelativeTime(lastMessageAt)}
        </ThemedText>
      </View>
      <View className="flex-row items-center justify-between gap-2">
        <ThemedText type="small" themeColor="textSecondary" className="flex-1">
          {lastMessage || 'No messages yet'}
        </ThemedText>
        {!!unreadCount && <Badge label={`${unreadCount} unread`} tone="info" />}
      </View>
    </Card>
  );
}
