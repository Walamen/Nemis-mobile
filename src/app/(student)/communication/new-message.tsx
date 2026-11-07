import { NewMessageScreen } from '@/components/messages/new-message-screen';

/**
 * New message — start a conversation with one of your teachers. The server
 * lists only teachers assigned to the student's current class and enforces
 * the same rule when the message is sent.
 */
export default function NewMessageToTeacherScreen() {
  return (
    <NewMessageScreen
      title="New message"
      searchPlaceholder="Search your teachers…"
      emptyTitle="No teachers to message yet"
      emptyDescription="Your teachers appear here once you're placed in a class with teachers assigned."
    />
  );
}
