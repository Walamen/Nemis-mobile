import { ScrollPage } from '@/components/layout/scroll-page';
import { HelpSupportContent } from '@/components/settings/help-support-content';
import { useSelectedChild } from '@/hooks/use-selected-child';

export default function HelpSupportScreen() {
  const { selectedChild } = useSelectedChild();

  return (
    <ScrollPage title="Help & support">
      <HelpSupportContent schoolName={selectedChild?.school} />
    </ScrollPage>
  );
}
