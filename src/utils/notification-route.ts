import type { Href } from 'expo-router';

/**
 * Server notifications carry a `link` to the equivalent *web* SIS page
 * (e.g. `/student/results`, `/messages/<conversationId>`). These are the
 * student-relevant links the server actually emits, mapped to the matching
 * app screen. Anything else (including links meant for other roles) has no
 * app equivalent and returns `null` — the notification is then just marked
 * read, never routed somewhere invented.
 */
const LINK_ROUTES: { pattern: RegExp; toHref: (match: RegExpMatchArray) => Href }[] = [
  { pattern: /^\/student\/fees\/?$/, toHref: () => '/fees/balance' as Href },
  { pattern: /^\/student\/results\/?$/, toHref: () => '/learning/grades' as Href },
  { pattern: /^\/student\/assignments\/?$/, toHref: () => '/tasks/assignments' as Href },
  { pattern: /^\/student\/timetable\/?$/, toHref: () => '/learning/timetable' as Href },
  {
    pattern: /^\/messages\/([^/?#]+)\/?$/,
    toHref: (match) => ({
      pathname: '/communication/conversation/[id]',
      params: { id: match[1]! },
    }),
  },
];

export function getNotificationHref(link: string | null | undefined): Href | null {
  if (!link) return null;
  for (const { pattern, toHref } of LINK_ROUTES) {
    const match = link.match(pattern);
    if (match) return toHref(match);
  }
  return null;
}
