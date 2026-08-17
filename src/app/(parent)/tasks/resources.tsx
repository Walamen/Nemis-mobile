import { useMemo, useState } from 'react';
import { Linking, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetParentResourcesQuery } from '@/api/parent/resources-api';
import { Card } from '@/components/common/card';
import { FilterPills } from '@/components/common/filter-pills';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';

const ALL = 'ALL' as const;

export default function ResourcesScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetParentResourcesQuery();
  const [category, setCategory] = useState<string>(ALL);

  // Categories aren't a fixed enum on this endpoint — derive the filter
  // options from whatever's actually present in the data.
  const categoriesPresent = useMemo(
    () => Array.from(new Set(data?.map((r) => r.category) ?? [])),
    [data],
  );
  const filterOptions = [
    { key: ALL, label: 'All' },
    ...categoriesPresent.map((c) => ({ key: c, label: c })),
  ];
  const filtered = data?.filter((r) => category === ALL || r.category === category);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        emptyMessage="No resources shared yet."
        onRetry={refetch}
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

          {filtered?.map((resource) => (
            <Card
              key={resource.id}
              className="mb-2 gap-1"
              onPress={() => Linking.openURL(resource.fileUrl)}
            >
              <ThemedText type="smallBold">{resource.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {resource.category}
                {resource.description ? ` · ${resource.description}` : ''}
              </ThemedText>
            </Card>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
