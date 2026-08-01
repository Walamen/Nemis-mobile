import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from '@/api/fetch-base-query';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me', 'Notifications', 'Assignments', 'Messages'],
  endpoints: () => ({}),
});
