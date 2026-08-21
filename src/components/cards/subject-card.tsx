import { Card } from '@/components/common/card';
import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { View } from '@/tw';

const TREND_ICON: Record<'up' | 'down', IconProps['name']> = {
  up: { ios: 'arrow.up.right', android: 'trending_up', web: 'trending_up' },
  down: { ios: 'arrow.down.right', android: 'trending_down', web: 'trending_down' },
};

const CLOCK_ICON: IconProps['name'] = { ios: 'clock', android: 'schedule', web: 'schedule' };

export type SubjectCardProps = {
  name: string;
  teacherName: string;
  letterGrade: string;
  attendanceRate: number;
  /** From `SubjectListItem.performance.trend` — omit the icon for `'stable'`. */
  trend?: 'up' | 'down' | 'stable';
  /**
   * Precomputed "next class" text (e.g. "Mon · 10:30 AM"). No utility exists
   * yet to derive this from `SubjectListItem.schedule` + the current date —
   * see docs/ROADMAP.md — so callers must compute it themselves until one is
   * built. Omit to hide the row entirely.
   */
  nextClassLabel?: string;
  onPress?: () => void;
  /** Overrides the default themed surface (`Card`'s `backgroundElement`). */
  backgroundColor?: string;
  className?: string;
};

export function SubjectCard({
  name,
  teacherName,
  letterGrade,
  attendanceRate,
  trend,
  nextClassLabel,
  onPress,
  backgroundColor,
  className,
}: SubjectCardProps) {
  const theme = useTheme();

  return (
    <Card onPress={onPress} backgroundColor={backgroundColor} className={className}>
      <View className="flex-row items-center justify-between">
        <ThemedText type="smallBold">{name}</ThemedText>
        {trend && trend !== 'stable' && (
          <Icon
            name={TREND_ICON[trend]}
            size="sm"
            color={trend === 'up' ? Palette.success : Palette.error}
          />
        )}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {teacherName}
      </ThemedText>
      <View className="flex-row items-center justify-between">
        <ThemedText type="small">Grade: {letterGrade}</ThemedText>
        <ThemedText type="small">Attendance: {attendanceRate}%</ThemedText>
      </View>
      {nextClassLabel && (
        <View className="flex-row items-center gap-1">
          <Icon name={CLOCK_ICON} size="sm" color={theme.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            Next class: {nextClassLabel}
          </ThemedText>
        </View>
      )}
    </Card>
  );
}
