import { useMemo, useState } from 'react';
import { Linking, RefreshControl, ScrollView } from 'react-native';

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
import { CardBackgroundColor } from '@/theme';

const ALL = 'ALL' as const;

export default function ResourcesScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetResourcesQuery();
  const [category, setCategory] = useState<ResourceCategory | typeof ALL>(ALL);

  const categoriesPresent = useMemo(
    () => Array.from(new Set(data?.map((r) => r.category) ?? [])),
    [data],
  );
  const filterOptions = [
    { key: ALL, label: 'All' },
    ...categoriesPresent.map((c) => ({ key: c, label: RESOURCE_CATEGORY_LABEL[c] })),
  ];
  const filtered = data?.filter((r) => category === ALL || r.category === category);

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Resources" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        onRetry={refetch}
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

          {filtered?.map((resource) => {
            const url = resource.type === 'LINK' ? resource.linkUrl : resource.fileUrl;
            return (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                subjectName={resource.subject.name}
                category={resource.category}
                type={resource.type}
                onPress={() => url && Linking.openURL(url)}
                backgroundColor={CardBackgroundColor}
                className="mb-2"
              />
            );
          })}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
