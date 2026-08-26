import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageContent } from '@/components/settings/language-content';

export default function LanguageScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <LanguageContent />
      </ScrollView>
    </SafeAreaView>
  );
}
