import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import {
  useGetMessageRecipientsQuery,
  useStartConversationMutation,
} from '@/api/messages/messages-api';
import { Button } from '@/components/buttons/button';
import { initialsOf } from '@/components/cards/message-card';
import { EmptyState } from '@/components/common/empty-state';
import { Icon } from '@/components/common/icon';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SectionHeader } from '@/components/layout/section-header';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { MessageRecipient } from '@/types/messages';
import { Pressable, Text, TextInput, View } from '@/tw';
import { getApiErrorMessage } from '@/utils/api-error';
import { messagingRoleLabel } from '@/utils/messaging-role';

function fullName(recipient: MessageRecipient) {
  return `${recipient.firstName} ${recipient.lastName}`;
}

function RecipientRow({
  recipient,
  onPress,
}: {
  recipient: MessageRecipient;
  onPress: () => void;
}) {
  const theme = useTheme();
  const name = fullName(recipient);
  const role = messagingRoleLabel(recipient.role);
  return (
    <Pressable
      className="mb-2 flex-row items-center gap-3 rounded-card px-4 py-3"
      style={{ backgroundColor: theme.card }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Message ${name}, ${role}`}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.backgroundSelected }}
      >
        <ThemedText type="smallBold">{initialsOf(name)}</ThemedText>
      </View>
      <View className="flex-1">
        <ThemedText type="smallBold">{name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {[role, recipient.institutionName].filter(Boolean).join(' · ')}
        </ThemedText>
      </View>
      <Icon
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size="sm"
        color={theme.textSecondary}
      />
    </Pressable>
  );
}

/**
 * New message — "Contact school". Lists the staff the server lets this
 * parent message (`GET /direct-messages/recipients`: teachers and school
 * administrators at their children's schools), split into School
 * administration and Teachers. Picking someone opens a first-message box;
 * sending starts (or reuses) the conversation and opens it.
 */
export default function NewMessageScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data, error, isLoading, isFetching, isError, refetch } = useGetMessageRecipientsQuery();
  const [startConversation, { isLoading: isSending }] = useStartConversationMutation();
  const [query, setQuery] = useState('');
  const [recipient, setRecipient] = useState<MessageRecipient | null>(null);
  const [message, setMessage] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const { admins, teachers } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (data ?? []).filter((r) => !q || fullName(r).toLowerCase().includes(q));
    return {
      admins: matches.filter((r) => r.role === 'INSTITUTION_ADMIN'),
      teachers: matches.filter((r) => r.role !== 'INSTITUTION_ADMIN'),
    };
  }, [data, query]);

  async function handleSend() {
    const trimmed = message.trim();
    if (!recipient || !trimmed) return;
    setSendError(null);
    try {
      const result = await startConversation({
        targetUserId: recipient.userId,
        initialMessage: trimmed,
      }).unwrap();
      const name = fullName(recipient);
      router.replace({
        pathname: '/communication/conversation/[id]',
        params: {
          id: result.conversation.id,
          teacherName: name,
          role: messagingRoleLabel(recipient.role),
        },
      });
    } catch (failure) {
      // The typed message stays so it can be retried.
      setSendError(`Message not sent. ${getApiErrorMessage(failure)}`);
    }
  }

  if (recipient) {
    const name = fullName(recipient);
    return (
      <AppScreen keyboardAvoiding>
        <AppHeader title={`Message ${recipient.firstName}`} />
        <View className="gap-3">
          <ThemedText type="small" themeColor="textSecondary">
            To {name} · {messagingRoleLabel(recipient.role)}
            {recipient.institutionName ? ` · ${recipient.institutionName}` : ''}
          </ThemedText>
          <TextInput
            className="min-h-32 rounded-input px-4 py-3 text-base"
            style={{
              backgroundColor: theme.backgroundElement,
              color: theme.text,
              textAlignVertical: 'top',
            }}
            placeholder="Write your message"
            placeholderTextColor={theme.textSecondary}
            value={message}
            onChangeText={setMessage}
            editable={!isSending}
            multiline
            autoFocus
            accessibilityLabel="Message"
          />
          {sendError && (
            <Text className="text-sm text-error" accessibilityLiveRegion="polite">
              {sendError}
            </Text>
          )}
          <Button
            label="Send"
            onPress={handleSend}
            isLoading={isSending}
            disabled={!message.trim()}
          />
          <Button
            variant="text"
            label="Choose someone else"
            onPress={() => {
              setRecipient(null);
              setSendError(null);
            }}
            disabled={isSending}
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Contact school" />
      <QueryState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={data?.length === 0}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={5} lines={2} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'person.2', android: 'group', web: 'group' }}
            title="No school staff to message yet"
            description="Staff appear here once your child's school links your account."
          />
        }
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="mb-1 flex-row items-center gap-2 rounded-input px-3.5 py-3"
            style={{ backgroundColor: theme.backgroundElement }}
          >
            <Icon
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size="sm"
              color={theme.textSecondary}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search school staff…"
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel="Search school staff"
              className="flex-1"
              style={{ color: theme.text, fontSize: 15 }}
            />
          </View>

          {admins.length > 0 && (
            <>
              <SectionHeader title="School administration" />
              {admins.map((r) => (
                <RecipientRow key={r.userId} recipient={r} onPress={() => setRecipient(r)} />
              ))}
            </>
          )}
          {teachers.length > 0 && (
            <>
              <SectionHeader title="Teachers" />
              {teachers.map((r) => (
                <RecipientRow key={r.userId} recipient={r} onPress={() => setRecipient(r)} />
              ))}
            </>
          )}
          {admins.length + teachers.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary" className="mt-6 text-center">
              No one matches “{query.trim()}”.
            </ThemedText>
          )}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
