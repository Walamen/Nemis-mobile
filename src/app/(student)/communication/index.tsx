import { useRouter, type Href } from 'expo-router';

import { ConversationList } from '@/components/messages/conversation-list';

/**
 * Inbox — the Student tab bar's "Inbox" tab: the teacher conversation list
 * (shared with the Parent app, see `ConversationList`), plus a compose
 * button to start a conversation with one of the student's teachers (see
 * `new-message.tsx`).
 */
export default function InboxScreen() {
  const router = useRouter();
  return (
    <ConversationList
      listLabel="Teachers"
      searchPlaceholder="Search teachers…"
      emptyDescription="Start a conversation with one of your teachers, or wait for them to message you."
      onCompose={() => router.push('/communication/new-message' as Href)}
    />
  );
}
