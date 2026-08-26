import { ScrollView } from 'react-native';

import { HelpSupportContent } from '@/components/settings/help-support-content';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { useAuth } from '@/hooks/use-auth';

export default function HelpSupportScreen() {
  const { user } = useAuth();

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Help & Support" />
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        <HelpSupportContent schoolName={user?.institution?.name} />
      </ScrollView>
    </AppScreen>
  );
}
