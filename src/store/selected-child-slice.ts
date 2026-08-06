import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type SelectedChildState = {
  childId: string | null;
};

const initialState: SelectedChildState = {
  childId: null,
};

export const selectedChildSlice = createSlice({
  name: 'selectedChild',
  initialState,
  reducers: {
    setSelectedChildId(state, action: PayloadAction<string | null>) {
      state.childId = action.payload;
    },
  },
});

export const { setSelectedChildId } = selectedChildSlice.actions;
export default selectedChildSlice.reducer;
