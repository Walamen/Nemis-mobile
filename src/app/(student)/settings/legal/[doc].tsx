import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import { EmptyState } from '@/components/common/empty-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { LegalDocumentContent } from '@/components/settings/legal-document-content';
import { LEGAL_DOCS, type LegalDocId } from '@/constants/legal-docs';

function isLegalDocId(value: string | undefined): value is LegalDocId {
  return !!value && value in LEGAL_DOCS;
}

export default function LegalDocumentScreen() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Legal" />
      {isLegalDocId(doc) ? (
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          <LegalDocumentContent docId={doc} />
        </ScrollView>
      ) : (
        <EmptyState title="Document not found" description="This document isn't available." />
      )}
    </AppScreen>
  );
}
