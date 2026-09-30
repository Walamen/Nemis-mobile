import type { UnknownAction } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query/react';

import { createBaseQueryWithReauth } from '@/api/fetch-base-query';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: createBaseQueryWithReauth({ resetApiStateAction }),
  tagTypes: ['Me', 'Notifications', 'Assignments', 'Messages'],
  // Revalidate cached queries (dashboard unread counts, notification/message
  // lists) when the app returns to the foreground or regains connectivity,
  // instead of leaving them stale until the screen unmounts/remounts. Only
  // takes effect where `setupListeners` is wired up (see `@/store`) — RTK
  // Query's default focus/online listeners are web-only (`window` events).
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

// Hoisted with an explicit return type so `apiSlice`'s own type doesn't
// depend on it (avoids a circular-inference `any`); only ever called after
// `apiSlice` is assigned, when a token refresh is rejected.
function resetApiStateAction(): UnknownAction {
  return apiSlice.util.resetApiState();
}
