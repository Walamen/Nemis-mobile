import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import { Palette } from '@/theme';
import { formatRelativeTime } from '@/utils/date';
import { View } from '@/tw';

export type MessageCardProps = {
  senderName: string;
  /** Secondary context line under the name (e.g. "Re: Amara Konneh" on the
   * parent side, scoping which child the conversation is about). */
  subtitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
  onPress?: () => void;
  className?: string;
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function MessageCard({
  senderName,
  subtitle,
  lastMessage,
  lastMessageAt,
  unreadCount,
  onPress,
  className,
}: MessageCardProps) {
  return (
    <Card onPress={onPress} className={`flex-row gap-3 ${className ?? ''}`}>
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: Palette.secondary50 }}
      >
        <ThemedText type="smallBold" style={{ color: Palette.secondary }}>
          {initialsOf(senderName)}
        </ThemedText>
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between gap-2">
          <ThemedText type="smallBold" className="flex-1" numberOfLines={1}>
            {senderName}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatRelativeTime(lastMessageAt)}
          </ThemedText>
        </View>
        {subtitle && (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
        <View className="flex-row items-center justify-between gap-2">
          <ThemedText type="small" themeColor="textSecondary" className="flex-1" numberOfLines={1}>
            {lastMessage || 'No messages yet'}
          </ThemedText>
          {!!unreadCount && <Badge label={`${unreadCount}`} tone="info" />}
        </View>
      </View>
    </Card>
  );
}
