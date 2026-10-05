import { Redirect, type Href } from 'expo-router';

/**
 * `/` for a signed-in parent. `RootNavigator` (`app/_layout.tsx`) sends every
 * user to `/` after login/role change, but the parent home lives at
 * `/dashboard` — without this route `/` had nothing to match in the parent
 * group.
 */
export default function ParentIndex() {
  return <Redirect href={'/dashboard' as Href} />;
}
