import { ScrollPage } from '@/components/layout/scroll-page';
import { AboutContent } from '@/components/settings/about-content';

export default function AboutScreen() {
  return (
    <ScrollPage title="About NEMIS">
      <AboutContent basePath="/profile" />
    </ScrollPage>
  );
}
