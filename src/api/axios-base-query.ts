import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxiosError, AxiosRequestConfig } from 'axios';

import { httpClient } from '@/services/http-client';

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
};

export type AxiosBaseQueryError = {
  status?: number;
  data: unknown;
};

export const axiosBaseQuery = (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> => {
  return async ({ url, method = 'GET', data, params }) => {
    try {
      const result = await httpClient({ url, method, data, params });
      // TEMPORARY diagnostic — remove once the redirect is confirmed working
      console.log('[axiosBaseQuery] success', {
        url,
        method,
        status: result.status,
        data: result.data,
      });
      return { data: result.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      // TEMPORARY diagnostic — remove once the redirect is confirmed working
      console.log('[axiosBaseQuery] error', {
        url,
        method,
        status: axiosError.response?.status,
        data: axiosError.response?.data ?? axiosError.message,
      });
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data ?? axiosError.message,
        },
      };
    }
  };
};
