import { Linking, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetResourcesQuery } from '@/api/tasks/resources-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';

export default function ResourcesScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetResourcesQuery();
  const theme = useTheme();

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
          {data?.map((resource) => {
            const url = resource.type === 'LINK' ? resource.linkUrl : resource.fileUrl;
            return (
              <Pressable
                key={resource.id}
                className="mb-2 gap-1 rounded-card p-4"
                style={{ backgroundColor: theme.backgroundElement }}
                onPress={() => url && Linking.openURL(url)}
              >
                <ThemedText type="smallBold">{resource.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {resource.subject.name} · {resource.category}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
