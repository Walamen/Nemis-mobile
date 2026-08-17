import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import { View } from '@/tw';

export type GradeCardProps = {
  subjectName: string;
  /** Omit when the source data has no computed letter grade (e.g. a single
   * assessment history entry, which the API only sends raw marks for) —
   * the trailing percentage is shown alone instead of faking one. */
  letterGrade?: string;
  percentage: number;
  /** Secondary line — e.g. an assessment name ("Midterm"). Omit for a plain
   * term-average row. */
  label?: string;
  onPress?: () => void;
  /** Overrides the default themed surface (`Card`'s `backgroundElement`). */
  backgroundColor?: string;
  className?: string;
};

export function GradeCard({
  subjectName,
  letterGrade,
  percentage,
  label,
  onPress,
  backgroundColor,
  className = '',
}: GradeCardProps) {
  return (
    <Card
      onPress={onPress}
      backgroundColor={backgroundColor}
      className={`flex-row items-center justify-between ${className}`}
    >
      <View className="flex-1">
        <ThemedText type="smallBold">{subjectName}</ThemedText>
        {label && (
          <ThemedText type="small" themeColor="textSecondary">
            {label}
          </ThemedText>
        )}
      </View>
      <ThemedText type="smallBold">
        {percentage.toFixed(1)}%{letterGrade ? ` (${letterGrade})` : ''}
      </ThemedText>
    </Card>
  );
}
