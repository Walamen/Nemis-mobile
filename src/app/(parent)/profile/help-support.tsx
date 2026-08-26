import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HelpSupportContent } from '@/components/settings/help-support-content';
import { useSelectedChild } from '@/hooks/use-selected-child';

export default function HelpSupportScreen() {
  const { selectedChild } = useSelectedChild();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <HelpSupportContent schoolName={selectedChild?.school} />
      </ScrollView>
    </SafeAreaView>
  );
}
