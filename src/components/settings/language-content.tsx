import { useState } from 'react';

import { Card } from '@/components/common/card';
import { Icon } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { CardBackgroundColor, Palette } from '@/theme';
import { View } from '@/tw';

type Language = {
  id: string;
  name: string;
  note: string;
};

const LANGUAGES: Language[] = [
  { id: 'en', name: 'English', note: 'Official language of instruction' },
  { id: 'kpe', name: 'Kpelle', note: 'Partial translation available' },
  { id: 'bsa', name: 'Bassa', note: 'Partial translation available' },
  { id: 'fr', name: 'Français', note: 'For cross-border families' },
];

/**
 * Language body — shared by the student (`(student)/settings/language`) and
 * parent (`(parent)/profile/language`) screens. Selection is local-only for
 * now: NEMIS has no localized strings yet, so picking a language doesn't
 * actually change anything in the app — same "visually real, not backend-
 * wired yet" treatment as `AuthHeader`'s decorative search bar.
 */
export function LanguageContent() {
  const [selected, setSelected] = useState('en');

  return (
    <View className="gap-2 pb-6">
      <ThemedText type="small" themeColor="textSecondary">
        Choose the language for menus, buttons and notifications. School names, teacher names and
        marks are not translated.
      </ThemedText>

      <View className="mt-2 gap-2">
        {LANGUAGES.map((language) => {
          const isSelected = language.id === selected;
          return (
            <Card
              key={language.id}
              backgroundColor={CardBackgroundColor}
              onPress={() => setSelected(language.id)}
              className={`flex-row items-center gap-3 border-l-4 ${isSelected ? 'border-secondary' : 'border-transparent'}`}
            >
              <View className="flex-1">
                <ThemedText type="smallBold">{language.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {language.note}
                </ThemedText>
              </View>
              {isSelected && (
                <Icon
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  size="sm"
                  color={Palette.secondary}
                />
              )}
            </Card>
          );
        })}
      </View>

      <ThemedText type="small" themeColor="textSecondary" className="mt-2">
        More Liberian languages are being added as translations are completed by the Ministry.
      </ThemedText>
    </View>
  );
}
