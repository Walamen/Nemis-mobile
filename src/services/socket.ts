import { io, type Socket } from 'socket.io-client';

import { API_BASE_URL } from '@/constants/api';

// The NEMIS server's real-time notification/message events (see
// `NotificationsGateway` on the server) are all emitted on this namespace —
// the same one the existing SIS/portal-web apps already connect to (see
// `apps/SIS/src/lib/socket.ts`). Reusing it keeps the mobile app on the
// same real-time infrastructure instead of standing up a second one.
const SOCKET_URL = `${API_BASE_URL}/notifications`;

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

/**
 * Connects (or returns the already-live connection) using a short-lived
 * socket token from `GET /auth/socket-token` — see `useRealtimeSync`, which
 * fetches that token and calls this. The long-lived access token isn't
 * reused directly here; the gateway expects its own token the same way the
 * web apps supply one.
 */
export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket?.disconnect();

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    auth: { token },
    // Same transport order as the existing web clients — polling first,
    // upgrading to a websocket — proven to work against this server/infra.
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
