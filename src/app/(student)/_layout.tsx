import { Tabs } from 'expo-router';

import { Icon } from '@/components/common/icon';
import { useTheme } from '@/hooks/use-theme';

export default function StudentTabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => (
            <Icon
              name={{ ios: 'square.grid.2x2', android: 'dashboard', web: 'dashboard' }}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: 'Learning',
          tabBarIcon: ({ color }) => (
            <Icon name={{ ios: 'book', android: 'menu_book', web: 'menu_book' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: 'Fees',
          tabBarIcon: ({ color }) => (
            <Icon
              name={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <Icon
              name={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="communication"
        options={{
          title: 'Communication',
          tabBarIcon: ({ color }) => (
            <Icon
              name={{ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Icon name={{ ios: 'gearshape', android: 'settings', web: 'settings' }} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
