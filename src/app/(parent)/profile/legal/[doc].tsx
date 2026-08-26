import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/common/empty-state';
import { LegalDocumentContent } from '@/components/settings/legal-document-content';
import { LEGAL_DOCS, type LegalDocId } from '@/constants/legal-docs';

function isLegalDocId(value: string | undefined): value is LegalDocId {
  return !!value && value in LEGAL_DOCS;
}

export default function LegalDocumentScreen() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isLegalDocId(doc) ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <LegalDocumentContent docId={doc} />
        </ScrollView>
      ) : (
        <EmptyState title="Document not found" description="This document isn't available." />
      )}
    </SafeAreaView>
  );
}
