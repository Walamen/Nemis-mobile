import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from '@/api/axios-base-query';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Me'],
  endpoints: () => ({}),
});
