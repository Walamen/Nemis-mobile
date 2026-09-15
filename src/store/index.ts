import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { AppState, type AppStateStatus } from 'react-native';

import { apiSlice } from '@/api/api-slice';
import selectedChildReducer from '@/store/selected-child-slice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    selectedChild: selectedChildReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

// RTK Query's `refetchOnFocus`/`refetchOnReconnect` (see `apiSlice`) do
// nothing until `setupListeners` is called — and its default handler
// listens for `window` focus/online events, which don't exist in React
// Native. This is the standard RN substitute: refetch active queries (e.g.
// the dashboard's unread count) when the app returns to the foreground.
// Network-reconnect refetching isn't wired up — that needs a connectivity
// listener (e.g. `@react-native-community/netinfo`), which isn't a
// dependency of this project yet.
setupListeners(store.dispatch, (dispatch, { onFocus, onFocusLost }) => {
  const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
    dispatch(status === 'active' ? onFocus() : onFocusLost());
  });

  return () => subscription.remove();
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
