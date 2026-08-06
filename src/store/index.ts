import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from '@/api/api-slice';
import selectedChildReducer from '@/store/selected-child-slice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    selectedChild: selectedChildReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
