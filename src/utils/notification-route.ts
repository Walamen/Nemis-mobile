import type { Href } from 'expo-router';

type LinkRoute = { pattern: RegExp; toHref: (match: RegExpMatchArray) => Href };

/**
 * Server notifications carry a `link` to the equivalent *web* SIS page
 * (e.g. `/student/results`, `/messages/<conversationId>`). These are the
 * student-relevant links the server actually emits, mapped to the matching
 * app screen. Anything else (including links meant for other roles) has no
 * app equivalent and returns `null` — the notification is then just marked
 * read, never routed somewhere invented.
 */
const STUDENT_LINK_ROUTES: LinkRoute[] = [
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

/**
 * The links the server sends to parents (guardians). Fee notifications go to
 * the student and their guardians with the same `/student/fees` link, so it
 * maps to the parent's Finance screen here. `/parent/notification` (exam
 * timetable updates) points at the notification list itself — nothing to
 * open. Parents get no message notifications on this list (the server
 * excludes `NEW_MESSAGE`), so `/messages/…` isn't mapped.
 */
const PARENT_LINK_ROUTES: LinkRoute[] = [
  { pattern: /^\/student\/fees\/?$/, toHref: () => '/finance' as Href },
  { pattern: /^\/parent\/results?\/?$/, toHref: () => '/academics/results' as Href },
  { pattern: /^\/parent\/resources?\/?$/, toHref: () => '/tasks/resources' as Href },
];

const LINK_ROUTES_BY_ROLE = { student: STUDENT_LINK_ROUTES, parent: PARENT_LINK_ROUTES };

export function getNotificationHref(
  link: string | null | undefined,
  role: keyof typeof LINK_ROUTES_BY_ROLE = 'student',
): Href | null {
  if (!link) return null;
  for (const { pattern, toHref } of LINK_ROUTES_BY_ROLE[role]) {
    const match = link.match(pattern);
    if (match) return toHref(match);
  }
  return null;
}
