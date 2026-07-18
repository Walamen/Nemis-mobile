import { apiSlice } from '@/api/api-slice';
import type { ApiEnvelope } from '@/types/auth';
import type { FeeRulesStatus } from '@/types/fees';

export const feesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getFeeRulesStatus: build.query<FeeRulesStatus, void>({
      query: () => ({ url: '/fees/student/me/fee-rules-status' }),
      transformResponse: (response: ApiEnvelope<FeeRulesStatus>) => response.data,
    }),
  }),
});

export const { useGetFeeRulesStatusQuery } = feesApi;
