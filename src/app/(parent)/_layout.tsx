import { Tabs } from 'expo-router';

import { Icon } from '@/components/common/icon';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';

export default function ParentTabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Palette.secondary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Icon name={{ ios: 'house', android: 'home', web: 'home' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="academics"
        options={{
          title: 'Academics',
          tabBarIcon: ({ color }) => (
            <Icon name={{ ios: 'book', android: 'menu_book', web: 'menu_book' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
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
          title: 'Inbox',
          tabBarIcon: ({ color }) => (
            <Icon
              name={{ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Icon
              name={{ ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
