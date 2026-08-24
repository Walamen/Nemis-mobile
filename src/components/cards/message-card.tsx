import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import { Palette } from '@/theme';
import { formatRelativeTime } from '@/utils/date';
import { Text, View } from '@/tw';

export type MessageCardProps = {
  senderName: string;
  /** Secondary context line under the name (e.g. "Re: Amara Konneh" on the
   * parent side, scoping which child the conversation is about). */
  subtitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
  onPress?: () => void;
  /** Overrides the default themed surface (`Card`'s `backgroundElement`). */
  backgroundColor?: string;
  /** Overrides the avatar's background — paired with `avatarTextColor`. */
  avatarBackgroundColor?: string;
  /** Overrides the avatar initials' color, and — when `unreadCount` is set
   * — the timestamp color and the unread badge's fill (a solid circle
   * instead of the default tinted `Badge` pill), matching the NEMIS
   * Design reference's Inbox row. Leaving this unset keeps every existing
   * caller's current look (light-tinted avatar, `Badge` pill) unchanged. */
  unreadAccentColor?: string;
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
  backgroundColor,
  avatarBackgroundColor,
  unreadAccentColor,
  className,
}: MessageCardProps) {
  const isUnread = !!unreadCount;

  return (
    <Card
      onPress={onPress}
      backgroundColor={backgroundColor}
      className={`flex-row gap-3 ${className ?? ''}`}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: avatarBackgroundColor ?? Palette.secondary50 }}
      >
        <ThemedText type="smallBold" style={{ color: unreadAccentColor ?? Palette.secondary }}>
          {initialsOf(senderName)}
        </ThemedText>
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between gap-2">
          <ThemedText type="smallBold" className="flex-1" numberOfLines={1}>
            {senderName}
          </ThemedText>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={isUnread && unreadAccentColor ? { color: unreadAccentColor } : undefined}
          >
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
          {!!unreadCount &&
            (unreadAccentColor ? (
              <View
                className="min-w-5 items-center justify-center rounded-full px-1.5"
                style={{ height: 20, backgroundColor: unreadAccentColor }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '900' }}>
                  {unreadCount}
                </Text>
              </View>
            ) : (
              <Badge label={`${unreadCount}`} tone="info" />
            ))}
        </View>
      </View>
    </Card>
  );
}
