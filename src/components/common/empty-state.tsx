import { Button } from '@/components/buttons/button';
import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useTheme } from '@/hooks/use-theme';

export type EmptyStateProps = {
  /** Icon shown in a circular `backgroundElement` badge above the title —
   * use one already established elsewhere in the app (e.g. a screen's own
   * quick-action/tab icon) rather than inventing a new symbol per screen. */
  icon?: IconProps['name'];
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

/** Standard "nothing here" screen — replaces a blank list with a reason and,
 * optionally, something to do about it. Default `loadingFallback` for
 * `QueryState`'s `isEmpty` branch (see `emptyFallback`); also usable
 * standalone anywhere a screen needs the same shape outside `QueryState`. */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <ThemedView className={`flex-1 items-center justify-center gap-2 px-6 ${className}`}>
      {icon && (
        <ThemedView
          type="backgroundElement"
          className="mb-2 h-16 w-16 items-center justify-center rounded-full"
        >
          <Icon name={icon} size="lg" color={theme.textSecondary} />
        </ThemedView>
      )}
      <ThemedText type="smallBold" className="text-center">
        {title}
      </ThemedText>
      {description && (
        <ThemedText type="small" themeColor="textSecondary" className="text-center">
          {description}
        </ThemedText>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="secondary" className="mt-2" />
      )}
    </ThemedView>
  );
}
