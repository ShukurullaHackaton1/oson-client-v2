import { createSlice } from '@reduxjs/toolkit';

const salesSlice = createSlice({
  name: 'sales',
  initialState: {
    sales: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setSales: (state, action) => {
      state.sales = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setSales, setLoading } = salesSlice.actions;
export default salesSlice.reducer;
