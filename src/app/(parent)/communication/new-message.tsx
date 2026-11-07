import { NewMessageScreen } from '@/components/messages/new-message-screen';

/** Contact school — message a teacher or the school administration. */
export default function ContactSchoolScreen() {
  return (
    <NewMessageScreen
      title="Contact school"
      searchPlaceholder="Search school staff…"
      emptyTitle="No school staff to message yet"
      emptyDescription="Staff appear here once your child's school links your account."
    />
  );
}
