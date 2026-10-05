import { useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/common/empty-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ScrollPage } from '@/components/layout/scroll-page';
import { LegalDocumentContent } from '@/components/settings/legal-document-content';
import { LEGAL_DOCS, type LegalDocId } from '@/constants/legal-docs';

function isLegalDocId(value: string | undefined): value is LegalDocId {
  return !!value && value in LEGAL_DOCS;
}

export default function LegalDocumentScreen() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();

  if (!isLegalDocId(doc)) {
    return (
      <AppScreen scroll={false} contentClassName="">
        <AppHeader title="Legal" />
        <EmptyState title="Document not found" description="This document isn't available." />
      </AppScreen>
    );
  }

  return (
    <ScrollPage title="Legal">
      <LegalDocumentContent docId={doc} />
    </ScrollPage>
  );
}
