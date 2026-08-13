import { Linking, RefreshControl, ScrollView } from 'react-native';

import { useGetResourcesQuery } from '@/api/tasks/resources-api';
import { ResourceCard } from '@/components/cards/resource-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';

export default function ResourcesScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetResourcesQuery();

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
          {data?.map((resource) => {
            const url = resource.type === 'LINK' ? resource.linkUrl : resource.fileUrl;
            return (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                subjectName={resource.subject.name}
                category={resource.category}
                type={resource.type}
                onPress={() => url && Linking.openURL(url)}
                className="mb-2"
              />
            );
          })}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
