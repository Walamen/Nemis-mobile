import { ScrollView } from 'react-native';

import { AboutContent } from '@/components/settings/about-content';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';

export default function AboutScreen() {
  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="About NEMIS" />
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <AboutContent basePath="/settings" />
      </ScrollView>
    </AppScreen>
  );
}
