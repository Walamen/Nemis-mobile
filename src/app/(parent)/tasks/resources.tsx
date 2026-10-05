import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetParentResourcesQuery } from '@/api/parent/resources-api';
import { Card } from '@/components/common/card';
import { EmptyState } from '@/components/common/empty-state';
import { FilterPills } from '@/components/common/filter-pills';
import { Icon } from '@/components/common/icon';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { openExternalUrl } from '@/services/external-link';
import type { SchoolResource } from '@/types/tasks';
import { Text, View } from '@/tw';

const ALL = 'ALL' as const;

export default function ResourcesScreen() {
  const theme = useTheme();
  const { data, error, isLoading, isFetching, isError, refetch } = useGetParentResourcesQuery();
  const [category, setCategory] = useState<string>(ALL);
  const [openError, setOpenError] = useState<string | null>(null);

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

  async function openResource(resource: SchoolResource) {
    setOpenError(null);
    const opened = await openExternalUrl(resource.fileUrl);
    if (!opened) {
      setOpenError(`Couldn't open "${resource.title}". The link may be unavailable.`);
    }
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Resources" />
      <QueryState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={data?.length === 0}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={4} lines={2} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
            title="No resources yet"
            description="Textbooks, past papers, and notes the school shares will appear here."
          />
        }
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
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
            <Card
              key={resource.id}
              backgroundColor={theme.card}
              className="mb-2"
              onPress={() => void openResource(resource)}
              accessibilityLabel={`${resource.title}. ${resource.category}.`}
              accessibilityHint="Opens in the browser"
            >
              <View className="flex-row items-center gap-3">
                <Icon
                  name={{ ios: 'doc.text', android: 'description', web: 'description' }}
                  size="md"
                  color={theme.textSecondary}
                />
                <View className="flex-1">
                  <ThemedText type="smallBold">{resource.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {resource.category}
                    {resource.description ? ` · ${resource.description}` : ''}
                  </ThemedText>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
