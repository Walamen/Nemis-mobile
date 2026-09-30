import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';

export type PublicStats = {
  totalInstitutions: number;
  totalStudents: number;
  totalCounties: number;
};

export const publicStatsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    // Live platform-wide counts (active schools/students/counties) — the
    // server's public, unauthenticated `GET /public-stats`.
    getPublicStats: build.query<PublicStats, void>({
      query: () => ({ url: '/public-stats' }),
      transformResponse: (response: ApiEnvelope<PublicStats>) => response.data,
    }),
  }),
});

export const { useGetPublicStatsQuery } = publicStatsApi;
