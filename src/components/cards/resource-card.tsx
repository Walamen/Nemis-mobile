import { Card } from '@/components/common/card';
import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { View } from '@/tw';

export type ResourceCategory = 'NOTES' | 'PAST_PAPER' | 'WORKSHEET' | 'REFERENCE' | 'OTHER';

export const RESOURCE_CATEGORY_LABEL: Record<ResourceCategory, string> = {
  NOTES: 'Notes',
  PAST_PAPER: 'Past Paper',
  WORKSHEET: 'Worksheet',
  REFERENCE: 'Reference',
  OTHER: 'Other',
};

const FILE_ICON: IconProps['name'] = {
  ios: 'doc.text',
  android: 'description',
  web: 'description',
};
const LINK_ICON: IconProps['name'] = { ios: 'link', android: 'link', web: 'link' };

export type ResourceCardProps = {
  title: string;
  subjectName: string;
  category: ResourceCategory;
  /** Picks the leading icon — a document for `'FILE'`, a link icon for `'LINK'`. */
  type: 'FILE' | 'LINK';
  onPress?: () => void;
  className?: string;
};

/** A class resource (a `ClassResource` — file or link a teacher shared for
 * a subject). Used by `(student)/tasks/resources.tsx`. */
export function ResourceCard({
  title,
  subjectName,
  category,
  type,
  onPress,
  className,
}: ResourceCardProps) {
  const theme = useTheme();

  return (
    <Card onPress={onPress} className={className}>
      <View className="flex-row items-center gap-3">
        <Icon
          name={type === 'FILE' ? FILE_ICON : LINK_ICON}
          size="md"
          color={theme.textSecondary}
        />
        <View className="flex-1">
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {subjectName} · {RESOURCE_CATEGORY_LABEL[category]}
          </ThemedText>
        </View>
      </View>
    </Card>
  );
}
