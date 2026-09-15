import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { apiSlice } from '@/api/api-slice';
import { authApi } from '@/api/auth/auth-api';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';
import type { UserNotificationType } from '@/types/notifications';

type NewNotificationEvent = {
  notificationType?: UserNotificationType;
};

type NewMessageEvent = {
  conversationId: string;
};

/**
 * Keeps notification/message caches live without polling. Subscribes to the
 * same `/notifications` Socket.IO namespace the existing SIS/portal-web
 * apps already use (see the server's `NotificationsGateway`) and invalidates
 * the matching RTK Query tags on each event, so every screen already
 * reading them (dashboard badge, notifications list, inbox) updates itself
 * through the existing cache-invalidation machinery — no second,
 * socket-driven state store.
 *
 * A `new-notification` whose `notificationType` is `NEW_MESSAGE` is skipped
 * here — that same message already arrives as its own `new-message` event
 * below (which invalidates `Messages`), and `notifications-api.ts` excludes
 * `NEW_MESSAGE` from the `Notifications`-tag unread count for the same
 * reason (see its `excludeType` doc comment): a direct message keeps two
 * independent `isRead` flags (the `DirectMessage` and its `UserNotification`
 * copy), so treating it as a `Notifications` change too would just be a
 * redundant refetch.
 *
 * Disconnects while the app is backgrounded (nothing to receive; saves
 * battery/data) and reconnects — with a freshly-issued socket token — when
 * it returns to the foreground, alongside RTK Query's own focus refetch
 * (see `@/store`'s `setupListeners`).
 */
export function useRealtimeSync(enabled: boolean) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function connect() {
      if (getSocket()?.connected) return;

      const tokenRequest = dispatch(
        authApi.endpoints.getSocketToken.initiate(undefined, { forceRefetch: true }),
      );
      let token: string;
      try {
        token = await tokenRequest.unwrap();
      } catch {
        // Offline, logged out mid-flight, etc. — REST screens still stay
        // correct via `refetchOnFocus`/pull-to-refresh; try again next time
        // the app comes to the foreground.
        return;
      } finally {
        tokenRequest.unsubscribe();
      }
      if (cancelled) return;

      const socket = connectSocket(token);

      socket.on('new-notification', (payload: NewNotificationEvent) => {
        if (payload.notificationType === 'NEW_MESSAGE') return;
        dispatch(apiSlice.util.invalidateTags(['Notifications']));
      });

      socket.on('new-message', (_payload: NewMessageEvent) => {
        dispatch(apiSlice.util.invalidateTags(['Messages']));
      });
    }

    void connect();

    const appStateSubscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'active') {
        void connect();
      } else {
        disconnectSocket();
      }
    });

    return () => {
      cancelled = true;
      appStateSubscription.remove();
      disconnectSocket();
    };
  }, [enabled, dispatch]);
}
