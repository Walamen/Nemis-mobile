import { Card } from '@/components/common/card';
import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { Palette } from '@/theme';
import { View } from '@/tw';

export type StatCardTrend = {
  direction: 'up' | 'down';
  label: string;
};

export type StatCardProps = {
  label: string;
  value: string;
  icon?: IconProps['name'];
  /** Only pass this when a real period-over-period figure exists — don't
   * fabricate a trend to fill the slot (see docs/PRODUCT_DECISIONS.md). */
  trend?: StatCardTrend;
  className?: string;
};

const TREND_ICON: Record<StatCardTrend['direction'], IconProps['name']> = {
  up: { ios: 'arrow.up.right', android: 'trending_up', web: 'trending_up' },
  down: { ios: 'arrow.down.right', android: 'trending_down', web: 'trending_down' },
};

export function StatCard({ label, value, icon, trend, className = '' }: StatCardProps) {
  const trendColor = trend?.direction === 'up' ? Palette.success : Palette.error;

  return (
    <Card className={`flex-1 ${className}`}>
      <View className="flex-row items-center justify-between">
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        {icon && <Icon name={icon} size="sm" color={Palette.secondary} />}
      </View>
      <ThemedText type="subtitle" className="text-2xl">
        {value}
      </ThemedText>
      {trend && (
        <View className="flex-row items-center gap-1">
          <Icon name={TREND_ICON[trend.direction]} size="sm" color={trendColor} />
          <ThemedText type="small" style={{ color: trendColor }}>
            {trend.label}
          </ThemedText>
        </View>
      )}
    </Card>
  );
}
