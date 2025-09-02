import { createSlice } from '@reduxjs/toolkit';

const remainsSlice = createSlice({
  name: 'remains',
  initialState: {
    remains: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setRemains: (state, action) => {
      state.remains = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setRemains, setLoading } = remainsSlice.actions;
export default remainsSlice.reducer;
