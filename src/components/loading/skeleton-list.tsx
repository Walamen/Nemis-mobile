import { SkeletonCard } from '@/components/loading/skeleton-card';
import { View } from '@/tw';

export type SkeletonListProps = {
  /** How many placeholder rows to show — pick something close to what the
   * screen typically renders (e.g. a page size), not an arbitrary number. */
  count?: number;
  lines?: 2 | 3;
  /** Applied to the wrapping container — pass the same padding the real
   * `ScrollView` uses so the skeleton lines up visually (e.g. `"px-4 pt-4"`). */
  className?: string;
};

/** Stack of `SkeletonCard`s for list screens (Subjects, Grades, Assignments,
 * Notifications, Messages) — pass as `QueryState`'s `loadingFallback`. */
export function SkeletonList({ count = 4, lines = 2, className }: SkeletonListProps) {
  return (
    <View className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} lines={lines} className="mb-2" />
      ))}
    </View>
  );
}
