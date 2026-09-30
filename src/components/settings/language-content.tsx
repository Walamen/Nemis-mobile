import { Card } from '@/components/common/card';
import { Icon } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { View } from '@/tw';

/**
 * Language body — shared by the student (`(student)/settings/language`) and
 * parent (`(parent)/profile/language`) screens. The app has no translations
 * yet, so this states that honestly: English is the only (and current)
 * language, and the others are listed as not yet available rather than
 * selectable with claims of partial translation.
 */
export function LanguageContent() {
  const theme = useTheme();

  return (
    <View className="gap-2 pb-6">
      <Card
        backgroundColor={theme.card}
        className="flex-row items-center gap-3 border-l-4 border-secondary"
        accessibilityLabel="English, current language"
      >
        <View className="flex-1">
          <ThemedText type="smallBold">English</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Current language
          </ThemedText>
        </View>
        <Icon
          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
          size="sm"
          color={Palette.secondary}
        />
      </Card>

      <Card backgroundColor={theme.card} className="gap-1">
        <ThemedText type="smallBold">Coming soon</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          The app is only available in English for now. Other languages aren&apos;t available yet.
        </ThemedText>
      </Card>
    </View>
  );
}
