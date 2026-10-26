import { useRouter, type Href } from 'expo-router';

import { ConversationList } from '@/components/messages/conversation-list';

/**
 * Parent Inbox — the same direct-message conversation list as the Student
 * Inbox (`ConversationList`), plus a compose button: parents can start a
 * conversation with their children's teachers or the school administration
 * (see `new-message.tsx`). Notifications live in the Menu sheet and the
 * dashboard bell. `/communication/messages` renders this same screen.
 */
export function ParentInbox({ showBack }: { showBack?: boolean }) {
  const router = useRouter();
  return (
    <ConversationList
      showBack={showBack}
      listLabel="School staff"
      searchPlaceholder="Search teachers…"
      emptyDescription="Start a conversation with your child's teacher or school, or wait for them to message you."
      onCompose={() => router.push('/communication/new-message' as Href)}
    />
  );
}

/** Inbox tab root — no back button. */
export default function InboxScreen() {
  return <ParentInbox showBack={false} />;
}
