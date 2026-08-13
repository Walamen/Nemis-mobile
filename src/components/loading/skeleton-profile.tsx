import { Skeleton } from '@/components/loading/skeleton';
import { View } from '@/tw';

/**
 * Placeholder shaped like a profile form: an avatar circle + a few
 * label/input pairs, matching `TextField`'s label + `rounded-input` rhythm.
 * For `QueryState`'s `loadingFallback` on profile screens.
 */
export function SkeletonProfile({
  fields = 3,
  avatar = true,
}: {
  fields?: number;
  /** Set `false` on screens whose real form has no avatar (e.g. `EditProfileForm`). */
  avatar?: boolean;
}) {
  return (
    <View className="gap-4">
      {avatar && (
        <View className="items-center">
          <Skeleton width={72} height={72} radius={36} />
        </View>
      )}
      {Array.from({ length: fields }).map((_, index) => (
        <View key={index} className="gap-1">
          <Skeleton width={80} height={12} />
          <Skeleton height={44} radius={12} />
        </View>
      ))}
    </View>
  );
}
