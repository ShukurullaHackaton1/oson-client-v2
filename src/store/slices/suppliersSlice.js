import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async () => {
    const response = await api.get('/suppliers');
    return response.data.data;
  }
);

export const fetchAvailableSuppliers = createAsyncThunk(
  'suppliers/fetchAvailableSuppliers',
  async () => {
    const response = await api.get('/suppliers/available');
    return response.data.data;
  }
);

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (supplierData) => {
    const response = await api.post('/suppliers', supplierData);
    return response.data.data;
  }
);

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState: {
    suppliers: [],
    availableSuppliers: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchAvailableSuppliers.fulfilled, (state, action) => {
        state.availableSuppliers = action.payload;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.suppliers.unshift(action.payload);
      });
  },
});

export const { clearError } = suppliersSlice.actions;
export default suppliersSlice.reducer;
