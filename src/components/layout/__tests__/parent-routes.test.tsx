import { describe, expect, it, jest } from '@jest/globals';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import MenuFallbackScreen from '@/app/(parent)/menu';
import ParentIndex from '@/app/(parent)/index';

// Records where a `<Redirect>` points instead of navigating.
jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Text testID="redirect">{href}</Text>;
  },
}));

function redirectTarget(element: React.ReactElement): string {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(element);
  });
  return renderer.root.findByProps({ testID: 'redirect' }).props.children as string;
}

describe('parent route fallbacks', () => {
  it('sends `/` (where RootNavigator lands every signed-in user) to the parent dashboard', () => {
    expect(redirectTarget(<ParentIndex />)).toBe('/dashboard');
  });

  it('sends the Menu tab fallback route to the parent dashboard, not a student route', () => {
    expect(redirectTarget(<MenuFallbackScreen />)).toBe('/dashboard');
  });
});
