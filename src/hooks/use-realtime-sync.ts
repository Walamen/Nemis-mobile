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

type ApiTag = Parameters<typeof apiSlice.util.invalidateTags>[0][number];

/**
 * Data that a notification of this type announces has changed, beyond the
 * notification list itself. `ASSIGNMENT_POSTED` is emitted to every student
 * in the class when a teacher creates an ACTIVE assignment — without this,
 * the new assignment only showed after an app restart.
 */
const EXTRA_TAGS_BY_TYPE: Partial<Record<UserNotificationType, ApiTag[]>> = {
  ASSIGNMENT_POSTED: ['Assignments'],
};

/**
 * Keeps notification/message (and, via notification type, assignment)
 * caches live without polling. Subscribes to the same `/notifications`
 * Socket.IO namespace the existing SIS/portal-web apps use (the server's
 * `NotificationsGateway`) and invalidates the matching RTK Query tags on
 * each event, so every screen reading them updates through the existing
 * cache-invalidation machinery — no second, socket-driven state store.
 *
 * A `new-notification` whose `notificationType` is `NEW_MESSAGE` is skipped
 * here — that same message already arrives as its own `new-message` event
 * below (which invalidates `Messages`), and `notifications-api.ts` excludes
 * `NEW_MESSAGE` from the `Notifications`-tag unread count for the same
 * reason: a direct message keeps two independent `isRead` flags.
 *
 * Disconnects while the app is backgrounded (nothing to receive; saves
 * battery/data) and reconnects when it returns to the foreground, alongside
 * RTK Query's own focus refetch (see `@/store`'s `setupListeners`). Each
 * connection attempt fetches a fresh socket token.
 */
export function useRealtimeSync(enabled: boolean) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) return;

    async function fetchSocketToken(): Promise<string> {
      const tokenRequest = dispatch(
        authApi.endpoints.getSocketToken.initiate(undefined, { forceRefetch: true }),
      );
      try {
        return await tokenRequest.unwrap();
      } finally {
        tokenRequest.unsubscribe();
      }
    }

    function connect() {
      if (getSocket()?.connected) return;

      const socket = connectSocket(fetchSocketToken);

      socket.on('new-notification', (payload: NewNotificationEvent) => {
        if (payload.notificationType === 'NEW_MESSAGE') return;
        const extraTags = payload.notificationType
          ? (EXTRA_TAGS_BY_TYPE[payload.notificationType] ?? [])
          : [];
        dispatch(apiSlice.util.invalidateTags(['Notifications', ...extraTags]));
      });

      socket.on('new-message', (_payload: NewMessageEvent) => {
        dispatch(apiSlice.util.invalidateTags(['Messages']));
      });
    }

    connect();

    const appStateSubscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'active') {
        connect();
      } else {
        disconnectSocket();
      }
    });

    return () => {
      appStateSubscription.remove();
      disconnectSocket();
    };
  }, [enabled, dispatch]);
}
