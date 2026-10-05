import { ParentInbox } from './index';

/**
 * `/communication/messages` — kept as a working route (older links point at
 * it). Same conversation list as the Inbox tab, but pushed onto the stack,
 * so it keeps the default back button.
 */
export default function MessagesScreen() {
  return <ParentInbox />;
}
