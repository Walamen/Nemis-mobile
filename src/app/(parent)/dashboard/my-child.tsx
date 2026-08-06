import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChildSwitcher } from '@/components/common/child-switcher';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { Image } from '@/tw/image';

export default function MyChildScreen() {
  const { selectedChild, isLoading, isFetching, isError, refetch } = useSelectedChild();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!selectedChild}
        emptyMessage="No children linked to your account yet."
        onRetry={refetch}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ChildSwitcher />

          {selectedChild && (
            <>
              <ThemedView className="mb-4 items-center gap-2">
                {selectedChild.photoUrl && (
                  <Image
                    source={{ uri: selectedChild.photoUrl }}
                    className="h-24 w-24 rounded-full"
                  />
                )}
                <ThemedText type="subtitle">
                  {selectedChild.firstName} {selectedChild.lastName}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Admission No. {selectedChild.studentId}
                </ThemedText>
              </ThemedView>

              <InfoRow label="Class" value={selectedChild.grade} />
              <InfoRow label="Homeroom" value={selectedChild.homeroom || '—'} />
              <InfoRow label="School" value={selectedChild.school} />
              <InfoRow label="District" value={selectedChild.district || '—'} />
              <InfoRow label="Principal" value={selectedChild.principal || '—'} />
              <InfoRow label="Attendance" value={`${selectedChild.attendance}%`} />
              <InfoRow label="Fees" value={selectedChild.feeLabel} />

              {selectedChild.subjects.length > 0 && (
                <>
                  <ThemedText type="sectionHeading" className="mb-2 mt-4">
                    Subjects
                  </ThemedText>
                  {selectedChild.subjects.map((subject) => (
                    <ThemedView
                      key={subject.name}
                      type="backgroundElement"
                      className="mb-2 flex-row items-center justify-between rounded-card p-4"
                    >
                      <ThemedText type="small">{subject.name}</ThemedText>
                      <ThemedText type="smallBold">{subject.finalGrade}</ThemedText>
                    </ThemedView>
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView className="mb-2 flex-row items-center justify-between rounded-card p-4" type="backgroundElement">
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </ThemedView>
  );
}
