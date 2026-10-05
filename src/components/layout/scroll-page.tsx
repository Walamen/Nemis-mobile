import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';

/**
 * Header + padded scrolling body for simple content pages (About, Language,
 * Help & support, …) — the exact shell the Student settings sub-screens use.
 */
export function ScrollPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title={title} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
      >
        {children}
      </ScrollView>
    </AppScreen>
  );
}
