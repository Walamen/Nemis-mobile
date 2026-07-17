import { useGetMeQuery, useLoginMutation, useLogoutMutation } from '@/api/auth-api';

export function useAuth() {
  const { data: user, isLoading, isUninitialized } = useGetMeQuery();
  const [login, loginState] = useLoginMutation();
  const [logout, logoutState] = useLogoutMutation();

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
