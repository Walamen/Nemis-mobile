import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import NewMessageToTeacherScreen from '@/app/(student)/communication/new-message';

// Shaped like `GET /direct-messages/recipients` for a STUDENT: only the
// teachers assigned to their class (DirectMessagesService.listEligibleRecipients).
const recipients = [
  {
    userId: 'teacher-user-1',
    firstName: 'Joseph',
    lastName: 'Tarpeh',
    role: 'TEACHER',
    institutionName: 'DaiMass School of Excellency',
  },
];

const mockReplace = jest.fn();
const mockStartConversation = jest.fn(
  (_body: { targetUserId: string; initialMessage: string }) => ({
    unwrap: () => Promise.resolve({ conversation: { id: 'conv-1' } }),
  }),
);

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('@/api/messages/messages-api', () => ({
  useGetMessageRecipientsQuery: () => ({
    data: recipients,
    error: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useStartConversationMutation: () => [mockStartConversation, { isLoading: false }],
}));

// The real theme/tw modules import global.css, which Jest can't parse — stub
// the UI building blocks with plain React Native pieces.
jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    text: '#000',
    textSecondary: '#666',
    card: '#eee',
    backgroundElement: '#f5f5f5',
    backgroundSelected: '#ddd',
  }),
}));
jest.mock('@/tw', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return { Pressable: RN.Pressable, Text: RN.Text, TextInput: RN.TextInput, View: RN.View };
});
jest.mock('@/components/typography/themed-text', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { ThemedText: Text };
});
jest.mock('@/components/buttons/button', () => {
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Button: ({ label, onPress }: { label: string; onPress: () => void }) => (
      <Pressable accessibilityLabel={label} onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});
jest.mock('@/components/cards/message-card', () => ({
  initialsOf: (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join(''),
}));
jest.mock('@/components/layout/app-header', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { AppHeader: ({ title }: { title: string }) => <Text>{title}</Text> };
});
jest.mock('@/components/layout/section-header', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { SectionHeader: ({ title }: { title: string }) => <Text>{title}</Text> };
});
jest.mock('@/components/layout/app-screen', () => ({
  AppScreen: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/components/common/query-state', () => ({
  QueryState: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/components/common/empty-state', () => ({ EmptyState: () => null }));
jest.mock('@/components/common/icon', () => ({ Icon: () => null }));
jest.mock('@/components/loading/skeleton-list', () => ({ SkeletonList: () => null }));

function pressable(renderer: ReactTestRenderer, label: string) {
  return renderer.root.find(
    (node) => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function',
  );
}

describe('Student New message (start a conversation with a teacher)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockStartConversation.mockClear();
  });

  it('lists the student’s teachers and sends the first message to the chosen one', async () => {
    let renderer!: ReactTestRenderer;
    await act(async () => {
      renderer = create(<NewMessageToTeacherScreen />);
    });

    // The teacher from the server's recipient list is offered…
    await act(async () => {
      pressable(renderer, 'Message Joseph Tarpeh, Teacher').props.onPress();
    });

    // …the compose box opens for them…
    const input = renderer.root.find(
      (node) => node.props.accessibilityLabel === 'Message' && 'onChangeText' in node.props,
    );
    await act(async () => {
      input.props.onChangeText('  Good morning sir, a question about the Biology test.  ');
    });

    // …and sending starts the conversation with the trimmed text.
    await act(async () => {
      await pressable(renderer, 'Send').props.onPress();
    });

    expect(mockStartConversation).toHaveBeenCalledWith({
      targetUserId: 'teacher-user-1',
      initialMessage: 'Good morning sir, a question about the Biology test.',
    });
    // The new conversation opens (it is in the Inbox via the Messages tag).
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/communication/conversation/[id]',
      params: { id: 'conv-1', teacherName: 'Joseph Tarpeh', role: 'Teacher' },
    });
  });

  it('does not send an empty message', async () => {
    let renderer!: ReactTestRenderer;
    await act(async () => {
      renderer = create(<NewMessageToTeacherScreen />);
    });
    await act(async () => {
      pressable(renderer, 'Message Joseph Tarpeh, Teacher').props.onPress();
    });
    await act(async () => {
      await pressable(renderer, 'Send').props.onPress();
    });
    expect(mockStartConversation).not.toHaveBeenCalled();
  });
});
