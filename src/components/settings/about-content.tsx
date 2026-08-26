import Constants from 'expo-constants';
import { Image } from 'expo-image';
import type { Href } from 'expo-router';

import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { MenuList, type MenuListItem } from '@/components/common/menu-list';
import { ThemedText } from '@/components/typography/themed-text';
import { LEGAL_DOC_ORDER, LEGAL_DOCS } from '@/constants/legal-docs';
import { useTheme } from '@/hooks/use-theme';
import { CardBackgroundColor } from '@/theme';
import { View } from '@/tw';

// PLACEHOLDER: illustrative nationwide figures, not real Ministry
// statistics — replace once a real endpoint or published report exists.
const STATS: { label: string; value: string }[] = [
  { label: 'Schools', value: '2,847' },
  { label: 'Students', value: '1.2M+' },
  { label: 'Counties', value: '15' },
];

// PLACEHOLDER: illustrative Ministry description and contact footer, not
// reviewed copy.
const DESCRIPTION =
  "NEMIS is the Republic of Liberia's unified digital platform for education, owned and operated by the Ministry of Education. It connects students, parents, teachers, school administrators and government officials across all 15 counties through a shared record of enrollment, attendance and performance.";
const FOOTER = 'Ministry of Education · Republic of Liberia\nBroad Street, Monrovia · nemis.gov.lr';

/**
 * About NEMIS body — shared by the student (`(student)/settings/about`) and
 * parent (`(parent)/profile/about`) screens. `basePath` builds the correct
 * per-role legal-document route (`/settings/legal/:doc` vs `/profile/legal/:doc`).
 */
export function AboutContent({ basePath }: { basePath: '/settings' | '/profile' }) {
  const theme = useTheme();
  const version = Constants.expoConfig?.version;
  const year = new Date().getFullYear();

  const legalItems: MenuListItem[] = LEGAL_DOC_ORDER.map((id) => ({
    label: LEGAL_DOCS[id].title,
    href: `${basePath}/legal/${id}` as Href,
  }));

  return (
    <View className="gap-5 pb-6">
      <View className="items-center gap-2 pb-2">
        <View
          className="items-center justify-center rounded-full border border-neutral-light"
          style={{ width: 88, height: 88, backgroundColor: theme.background }}
        >
          <Image
            source={require('@/assets/images/icon.png')}
            style={{ width: 60, height: 60 }}
            contentFit="contain"
          />
        </View>
        <ThemedText type="title" className="mt-2 tracking-wide">
          NEMIS
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" className="text-center">
          National Education Management{'\n'}Information System
        </ThemedText>
        {!!version && <Badge label={`Version ${version}`} className="mt-1" />}
      </View>

      <Card backgroundColor={CardBackgroundColor}>
        <ThemedText themeColor="textSecondary">{DESCRIPTION}</ThemedText>
      </Card>

      <View className="flex-row gap-3">
        {STATS.map((stat) => (
          <Card
            key={stat.label}
            backgroundColor={CardBackgroundColor}
            className="flex-1 items-center"
          >
            <ThemedText type="subtitle" className="text-2xl">
              {stat.value}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {stat.label}
            </ThemedText>
          </Card>
        ))}
      </View>

      <MenuList items={legalItems} backgroundColor={CardBackgroundColor} />

      <ThemedText type="small" themeColor="textSecondary" className="text-center">
        {FOOTER}
        {'\n'}© {year} Republic of Liberia. All rights reserved.
      </ThemedText>
    </View>
  );
}
