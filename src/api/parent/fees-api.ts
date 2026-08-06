import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { FeeRulesStatus } from '@/types/fees';

export const parentFeesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getChildFeeRulesStatus: build.query<FeeRulesStatus, string>({
      query: (childId) => ({ url: `/parent/children/${childId}/all-fee-rules-status` }),
      transformResponse: (response: ApiEnvelope<FeeRulesStatus>) => response.data,
    }),
  }),
});

export const { useGetChildFeeRulesStatusQuery } = parentFeesApi;
