import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetResourcesQuery } from '@/api/tasks/resources-api';
import {
  ResourceCard,
  RESOURCE_CATEGORY_LABEL,
  type ResourceCategory,
} from '@/components/cards/resource-card';
import { EmptyState } from '@/components/common/empty-state';
import { FilterPills } from '@/components/common/filter-pills';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { useTheme } from '@/hooks/use-theme';
import { openExternalUrl } from '@/services/external-link';
import type { ClassResource } from '@/types/tasks';
import { Text } from '@/tw';

const ALL = 'ALL' as const;

export default function ResourcesScreen() {
  const theme = useTheme();
  const { data, error, isLoading, isFetching, isError, refetch } = useGetResourcesQuery();
  const [category, setCategory] = useState<ResourceCategory | typeof ALL>(ALL);
  const [openError, setOpenError] = useState<string | null>(null);

  const categoriesPresent = useMemo(
    () => Array.from(new Set(data?.map((r) => r.category) ?? [])),
    [data],
  );
  const filterOptions = [
    { key: ALL, label: 'All' },
    ...categoriesPresent.map((c) => ({ key: c, label: RESOURCE_CATEGORY_LABEL[c] })),
  ];
  const filtered = data?.filter((r) => category === ALL || r.category === category);

  async function openResource(resource: ClassResource) {
    setOpenError(null);
    const url = resource.type === 'LINK' ? resource.linkUrl : resource.fileUrl;
    const opened = await openExternalUrl(url);
    if (!opened) {
      setOpenError(`Couldn't open "${resource.title}". The link may be unavailable.`);
    }
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Resources" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={data?.length === 0}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={4} lines={2} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
            title="No resources yet"
            description="Notes, past papers, and other materials your teachers share will appear here."
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {categoriesPresent.length > 1 && (
            <FilterPills
              options={filterOptions}
              value={category}
              onChange={setCategory}
              className="mb-4"
            />
          )}

          {openError && (
            <Text className="mb-3 text-sm text-error" accessibilityLiveRegion="polite">
              {openError}
            </Text>
          )}

          {filtered?.map((resource) => (
            <ResourceCard
              key={resource.id}
              title={resource.title}
              subjectName={resource.subject.name}
              category={resource.category}
              type={resource.type}
              onPress={() => void openResource(resource)}
              backgroundColor={theme.card}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
