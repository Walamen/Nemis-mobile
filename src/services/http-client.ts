import axios, { type AxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '@/constants/api';

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

// eslint-disable-next-line import/no-named-as-default-member -- axios's default export includes `create`
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'x-app-context': 'sis',
  },
});

let refreshPromise: Promise<void> | null = null;

function shouldAttemptRefresh(config: RetryableConfig): boolean {
  if (config._retry) return false;
  const url = config.url ?? '';
  return !NO_REFRESH_PATHS.some((path) => url.includes(path));
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig | undefined;

    if (error.response?.status !== 401 || !config || !shouldAttemptRefresh(config)) {
      return Promise.reject(error);
    }

    config._retry = true;

    refreshPromise ??= httpClient
      .post('/auth/refresh')
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });

    try {
      await refreshPromise;
      return httpClient(config);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
