# NEMIS Mobile — API Mapping

> Every RTK Query endpoint in the codebase, grouped by slice file, with its
> HTTP method/URL and the exported hook screens actually call. **The backend
> already exists — never add a new endpoint here without confirming it isn't
> already covered by one of these.** Base URL, auth, and retry behavior are
> documented in [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md#6-authentication-model).

All responses are unwrapped from a shared `ApiEnvelope<T>` shape via each
endpoint's `transformResponse` — components never see the envelope.

## Auth — `src/api/auth/auth-api.ts`

| Hook | Method | URL | Notes |
|---|---|---|---|
| `useGetMeQuery` | GET | `/auth/me` | Session check; drives `isAuthenticated`/`isCheckingSession` in `useAuth` |
| `useLoginMutation` | POST | `/auth/login` | Persists tokens via `setAuthTokens` on success |
| `useLogoutMutation` | POST | `/auth/logout` | Custom `queryFn` — sends `sid` from SecureStore, clears local tokens regardless of server outcome |
| `useLogoutAllMutation` | POST | `/auth/logout-all` | |
| `useRequestPasswordResetMutation` | POST | `/users/password-reset/request` | |
| `useConfirmPasswordResetMutation` | POST | `/users/password-reset/confirm` | |

Token refresh (`POST /auth/refresh`) is not a hook — it's called internally
by `baseQueryWithReauth` on any `401` outside `NO_REFRESH_PATHS`.

## Profile — `src/api/profile/profile-api.ts`

| Hook | Method | URL | Used by |
|---|---|---|---|
| `useGetProfileQuery` | GET | `/users/profile` | `EditProfileForm` |
| `useUpdateProfileMutation` | PATCH | `/users/profile` | `EditProfileForm` |
| `useChangePasswordMutation` | PATCH | `/users/profile` | `ChangePasswordForm` (same URL as update-profile — password is a field on the same resource) |

Shared verbatim by both student and parent Settings/Profile screens.

## Student — dashboard, subjects, timetable, grades, attendance, fees, tasks

| Slice | Hook | Method | URL |
|---|---|---|---|
| `src/api/student/dashboard-api.ts` | `useGetStudentDashboardQuery` | GET | `/student/profile/dashboard` |
| `src/api/student/subjects-api.ts` | `useGetSubjectsQuery` | GET | `/student/profile/subjects/me` |
| | `useGetSubjectDetailQuery(id)` | GET | `/student/profile/subjects/me/:id` |
| `src/api/timetable/timetable-api.ts` | `useGetMyTimetableQuery` | GET | `/timetables/student/me/timetable` |
| `src/api/grades/grades-api.ts` | `useGetReportCardQuery` | GET | `/grades/student/me/report-card` |
| | `useGetResultsQuery(termId?)` | GET | `/grades/student/me/results` |
| | `useGetAssessmentGradesQuery(params?)` | GET | `/grades/student/me/assessments` |
| `src/api/attendance/attendance-api.ts` | `useGetMyAttendanceQuery({startDate?,endDate?})` | GET | `/attendance/student/me` |
| `src/api/fees/fees-api.ts` | `useGetFeeRulesStatusQuery` | GET | `/fees/student/me/fee-rules-status` |
| `src/api/tasks/assignments-api.ts` | `useGetAssignmentsQuery` | GET | `/student/assignments` |
| | `useGetAssignmentDetailQuery(id)` | GET | `/student/assignments/:id` |
| | `useSubmitAssignmentMutation` | POST (multipart) | `/student/assignments/:id/submit` |
| `src/api/tasks/resources-api.ts` | `useGetResourcesQuery(subjectId?)` | GET | `/student/resources` |

`submitAssignment` builds a `FormData` (response text + optional file) —
the one non-JSON mutation body in the codebase.

## Student — messages, notifications

| Slice | Hook | Method | URL |
|---|---|---|---|
| `src/api/messages/messages-api.ts` | `useGetAnnouncementsQuery` | GET | `/messages/student/me/announcements` |
| | `useGetConversationsQuery` | GET | `/direct-messages/conversations` |
| | `useGetConversationMessagesQuery(id)` | GET | `/direct-messages/conversations/:id/messages` |
| | `useSendConversationMessageMutation` | POST | `/direct-messages/conversations/:id/messages` |
| `src/api/notifications/notifications-api.ts` | `useGetNotificationsQuery(params?)` | GET | `/user-notifications` |
| | `useGetUnreadNotificationCountQuery` | GET | `/user-notifications/unread-count` |
| | `useMarkNotificationReadMutation(id)` | PATCH | `/user-notifications/:id/read` |
| | `useMarkAllNotificationsReadMutation` | PATCH | `/user-notifications/read-all` |

`/user-notifications` is shared infra — not `/student/...`-namespaced —
but only wired into the student communication screens today (the parent
side has its own `parentNotificationsApi` against `/parent/notifications`,
not this endpoint).

## Parent — `src/api/parent/*`

| Slice | Hook | Method | URL |
|---|---|---|---|
| `children-api.ts` | `useGetMyChildrenQuery` | GET | `/parent/children` |
| `dashboard-api.ts` | `useGetParentDashboardQuery` | GET | `/parent/dashboard` |
| `academics-api.ts` | `useGetChildAssessmentGradesQuery({childId,...})` | GET | `/parent/academics/:childId/assessments` |
| | `useGetChildReportCardQuery(childId)` | GET | `/parent/academics/:childId/report-card` |
| `attendance-api.ts` | `useGetChildAttendanceQuery({childId,startDate?,endDate?,status?})` | GET | `/parent/children/:childId/attendance` |
| `assignments-api.ts` | `useGetChildAssignmentsQuery(childId)` | GET | `/parent/children/:childId/assignments` |
| `fees-api.ts` | `useGetChildFeeRulesStatusQuery(childId)` | GET | `/parent/children/:childId/all-fee-rules-status` |
| `resources-api.ts` | `useGetChildClassResourcesQuery({childId,subjectId?})` | GET | `/parent/children/:childId/resources` |
| | `useGetParentResourcesQuery` | GET | `/parent/resources` |
| `messages-api.ts` | `useGetParentConversationsQuery` | GET | `/parent/conversations` |
| | `useGetParentConversationMessagesQuery(id)` | GET | `/parent/conversations/:id/messages` |
| | `useSendParentConversationMessageMutation` | POST | `/parent/conversations/:id/messages` |
| `notifications-api.ts` | `useGetParentNotificationsQuery` | GET | `/parent/notifications` |
| | `useMarkParentNotificationReadMutation(id)` | PATCH | `/parent/notifications/:id/read` |

Every parent endpoint that scopes to one child takes an explicit `childId`
argument — the calling screen is responsible for supplying it from
`useSelectedChild`, RTK Query does not read Redux state directly.

## `apiSlice` tag graph

`src/api/api-slice.ts` declares 4 tag types: `Me`, `Notifications`,
`Assignments`, `Messages`.

| Tag | Provided by | Invalidated by |
|---|---|---|
| `Me` | `getMe`, `getProfile` | `login`, `logout`, `logoutAll`, `updateProfile` |
| `Notifications` | `getNotifications`, `getUnreadNotificationCount`, `getParentNotifications` | `markNotificationRead`, `markAllNotificationsRead`, `markParentNotificationRead` |
| `Assignments` | `getAssignments`, `getAssignmentDetail` | `submitAssignment` |
| `Messages` | `getConversations`, `getConversationMessages`, `getParentConversations`, `getParentConversationMessages` | `sendConversationMessage`, `sendParentConversationMessage` |

**Known gap:** most read endpoints (dashboard, subjects, timetable, grades,
attendance, fees, resources — both student and parent) don't `provideTags`
at all, so nothing auto-invalidates them; screens rely on RTK Query's
default cache lifetime + manual `refetch()` (pull-to-refresh) instead. If a
new mutation needs to invalidate one of these, add a tag rather than
reaching for `refetchOnMountOrArgChange` everywhere.

## Related documents

- [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md) — which screen
  consumes which endpoint.
- [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md) — auth/token flow these
  endpoints run through.
