import { useGetMeQuery, useLoginMutation, useLogoutMutation } from '@/api/auth/auth-api';

export function useAuth() {
  const meQuery = useGetMeQuery();
  const { data: user, isLoading, isUninitialized } = meQuery;
  const [login, loginState] = useLoginMutation();
  const [logout, logoutState] = useLogoutMutation();

  // TEMPORARY diagnostic — remove once the redirect is confirmed working
  console.log('[useAuth] getMe state', {
    isUninitialized: meQuery.isUninitialized,
    isLoading: meQuery.isLoading,
    isFetching: meQuery.isFetching,
    isSuccess: meQuery.isSuccess,
    isError: meQuery.isError,
    error: meQuery.error,
    data: meQuery.data,
  });
  console.log('[useAuth] login mutation state', {
    isLoading: loginState.isLoading,
    isSuccess: loginState.isSuccess,
    isError: loginState.isError,
    error: loginState.error,
    data: loginState.data,
  });

  return {
    user,
    isAuthenticated: Boolean(user),
    isCheckingSession: isLoading || isUninitialized,
    login,
    isLoggingIn: loginState.isLoading,
    logout,
    isLoggingOut: logoutState.isLoading,
  };
}
