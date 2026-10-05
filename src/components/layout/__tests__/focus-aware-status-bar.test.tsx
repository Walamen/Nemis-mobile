import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { FocusAwareStatusBar } from '@/components/layout/focus-aware-status-bar';

let mockIsFocused = true;

jest.mock('expo-router', () => ({
  useIsFocused: () => mockIsFocused,
}));

// Stand-in that records the requested style instead of touching native APIs.
jest.mock('expo-status-bar', () => ({
  StatusBar: (props: { style: string }) => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Text testID="status-bar">{props.style}</Text>;
  },
}));

function render(element: React.ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(element);
  });
  return renderer;
}

function appliedStyle(renderer: ReactTestRenderer): string | null {
  const bars = renderer.root.findAll((node) => node.props.testID === 'status-bar');
  return bars.length ? (bars[0]!.props.children as string) : null;
}

describe('FocusAwareStatusBar', () => {
  beforeEach(() => {
    mockIsFocused = true;
  });

  it('applies light content while the dashboard is focused', () => {
    expect(appliedStyle(render(<FocusAwareStatusBar style="light" />))).toBe('light');
  });

  it('renders nothing while its screen is not focused, so the focused screen wins', () => {
    mockIsFocused = false;
    expect(appliedStyle(render(<FocusAwareStatusBar style="light" />))).toBeNull();
  });

  it('re-applies when the screen regains focus (returning to a dashboard)', () => {
    mockIsFocused = false;
    const renderer = render(<FocusAwareStatusBar style="light" />);
    expect(appliedStyle(renderer)).toBeNull();

    mockIsFocused = true;
    act(() => {
      renderer.update(<FocusAwareStatusBar style="light" />);
    });
    expect(appliedStyle(renderer)).toBe('light');
  });
});
