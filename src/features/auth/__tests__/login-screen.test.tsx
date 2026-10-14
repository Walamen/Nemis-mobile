import { describe, expect, it, jest } from '@jest/globals';
import type { ReactNode } from 'react';
import { TextInput } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import LoginScreen from '@/app/(auth)/index';

// Real forms and fields; only the network, storage and chrome are stubbed.
jest.mock('@/api/auth/auth-api', () => ({
  useLoginMutation: () => [jest.fn(), { isLoading: false }],
}));
jest.mock('@/services/remembered-login', () => ({
  getRememberedLogin: () => Promise.resolve(null),
  setRememberedLogin: () => Promise.resolve(),
  clearRememberedLogin: () => Promise.resolve(),
}));
jest.mock('@/components/auth/auth-screen-shell', () => ({
  AuthScreenShell: ({ children }: { children: ReactNode }) => children,
  useAuthFieldFocusScroll: () => null,
}));
jest.mock('@/components/common/icon', () => ({ Icon: () => null }));
jest.mock('@/components/buttons/button', () => ({ Button: () => null }));
jest.mock('@/tw', () => ({ Link: ({ children }: { children: ReactNode }) => children }));
// The real theme module imports global.css, which Jest can't parse.
jest.mock('@/theme', () => ({
  Palette: { secondary: '#121894', error: '#d92d20' },
  DisplayFontFamily: undefined,
}));

async function renderLogin(): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<LoginScreen />);
  });
  return renderer;
}

function inputByPlaceholder(renderer: ReactTestRenderer, placeholder: string) {
  return renderer.root.findAll(
    (node) => node.type === TextInput && node.props.placeholder === placeholder,
  )[0]!;
}

async function typeInto(renderer: ReactTestRenderer, placeholder: string, text: string) {
  await act(async () => {
    inputByPlaceholder(renderer, placeholder).props.onChangeText(text);
  });
}

async function selectTab(renderer: ReactTestRenderer, label: 'parent' | 'student') {
  await act(async () => {
    renderer.root.findByProps({ accessibilityLabel: `Sign in as ${label}` }).props.onPress();
  });
}

// A cold (uncached) run spends several seconds on the first render alone.
jest.setTimeout(30_000);

describe('LoginScreen', () => {
  it('keeps what a parent types after switching from the Student tab', async () => {
    const renderer = await renderLogin();
    await selectTab(renderer, 'parent');

    await typeInto(renderer, 'you@example.com', 'musu.konneh@gmail.com');
    await typeInto(renderer, 'Enter your password', 'secret-password');

    expect(inputByPlaceholder(renderer, 'you@example.com').props.value).toBe(
      'musu.konneh@gmail.com',
    );
    expect(inputByPlaceholder(renderer, 'Enter your password').props.value).toBe(
      'secret-password',
    );
  });

  it('keeps student input working after switching tabs back and forth', async () => {
    const renderer = await renderLogin();
    await selectTab(renderer, 'parent');
    await selectTab(renderer, 'student');

    await typeInto(renderer, '4829-1573-6045', '482915736045');

    expect(inputByPlaceholder(renderer, '4829-1573-6045').props.value).toBe('4829-1573-6045');
  });
});
