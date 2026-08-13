import { Card } from '@/components/common/card';
import { Skeleton } from '@/components/loading/skeleton';

export type SkeletonCardProps = {
  /** Number of placeholder lines — 2 matches most cards (title + subtitle),
   * 3 matches ones with an extra row (e.g. `AssignmentCard`'s status badge). */
  lines?: 2 | 3;
  className?: string;
};

/** Placeholder shaped like the generic `Card` row every domain card in
 * `src/components/cards/` uses — for `QueryState`'s `loadingFallback`. */
export function SkeletonCard({ lines = 2, className }: SkeletonCardProps) {
  return (
    <Card className={className}>
      <Skeleton height={16} width="60%" />
      <Skeleton height={13} width="40%" />
      {lines === 3 && <Skeleton height={13} width="30%" />}
    </Card>
  );
}
