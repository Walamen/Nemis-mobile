import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import { LEGAL_DOCS, type LegalDocId } from '@/constants/legal-docs';
import { CardBackgroundColor, Palette } from '@/theme';
import { View } from '@/tw';

/**
 * One legal document (Privacy notice, Terms of use, Data protection policy,
 * Open source licences) — reached from About NEMIS on both the student and
 * parent side. See `@/constants/legal-docs` for the placeholder-content
 * caveat.
 */
export function LegalDocumentContent({ docId }: { docId: LegalDocId }) {
  const doc = LEGAL_DOCS[docId];

  return (
    <View className="gap-5 pb-6">
      <View className="gap-1">
        <ThemedText type="small" themeColor="textSecondary" className="tracking-wide">
          MINISTRY OF EDUCATION · REPUBLIC OF LIBERIA
        </ThemedText>
        <ThemedText type="title">{doc.title}</ThemedText>
        <View className="flex-row flex-wrap gap-2 pt-1">
          <Badge label={doc.version} />
          <Badge label={doc.updated} />
        </View>
      </View>

      <Card backgroundColor={CardBackgroundColor}>
        <ThemedText themeColor="textSecondary">{doc.intro}</ThemedText>
      </Card>

      <View className="gap-4">
        {doc.sections.map((section, index) => (
          <View key={section.heading} className="flex-row gap-3">
            <ThemedText type="smallBold" style={{ color: Palette.secondary, minWidth: 22 }}>
              {String(index + 1).padStart(2, '0')}
            </ThemedText>
            <View className="flex-1 gap-1">
              <ThemedText type="smallBold">{section.heading}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {section.body}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      <Card backgroundColor={CardBackgroundColor} className="gap-1 border-l-4 border-secondary">
        <ThemedText type="smallBold">{doc.contactTitle}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {doc.contactBody}
        </ThemedText>
      </Card>
    </View>
  );
}
