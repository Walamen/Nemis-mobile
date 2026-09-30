import { useGetMeQuery, useLoginMutation, useLogoutMutation } from '@/api/auth/auth-api';
import { getApiErrorKind } from '@/utils/api-error';

export function useAuth() {
  const { data: user, isLoading, isUninitialized, isFetching, error, refetch } = useGetMeQuery();
  const [login, loginState] = useLoginMutation();
  const [logout, logoutState] = useLogoutMutation();

  // Only a 401 means "not signed in". If the session check couldn't reach the
  // server (offline, timeout, 5xx), the stored session may be perfectly
  // valid — sending the student to login would be wrong.
  const errorKind = getApiErrorKind(error);
  const isSessionUnverified = !user && (errorKind === 'offline' || errorKind === 'server');

  return {
    user,
    isAuthenticated: Boolean(user),
    // Also true while retrying an unreachable session check (RTK Query keeps
    // `error` during the refetch), so a retry shows the loader. Deliberately
    // not any `!user && isFetching` — a failed login's `Me` refetch would
    // then unmount the login form and its error message.
    isCheckingSession: isLoading || isUninitialized || (isSessionUnverified && isFetching),
    isSessionUnverified,
    retrySessionCheck: refetch,
    login,
    isLoggingIn: loginState.isLoading,
    logout,
    isLoggingOut: logoutState.isLoading,
  };
}
