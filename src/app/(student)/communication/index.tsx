import { ConversationList } from '@/components/messages/conversation-list';

/**
 * Inbox — the Student tab bar's "Inbox" tab: the teacher conversation list
 * (shared with the Parent app, see `ConversationList`). Students reply to
 * teachers here; they don't start conversations, so there's no compose button.
 */
export default function InboxScreen() {
  return (
    <ConversationList
      listLabel="Teachers"
      searchPlaceholder="Search teachers…"
      emptyDescription="Messages from your teachers will show up here."
    />
  );
}
