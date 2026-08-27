import { ScrollView } from 'react-native';

import { LanguageContent } from '@/components/settings/language-content';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';

export default function LanguageScreen() {
  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Language" />
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <LanguageContent />
      </ScrollView>
    </AppScreen>
  );
}
