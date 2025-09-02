import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async () => {
    const response = await api.get('/doctors');
    return response.data.data;
  }
);

export const createDoctor = createAsyncThunk(
  'doctors/createDoctor',
  async (doctorData) => {
    const response = await api.post('/doctors', doctorData);
    return response.data.data;
  }
);

export const deleteDoctor = createAsyncThunk(
  'doctors/deleteDoctor',
  async (id) => {
    await api.delete(`/doctors/${id}`);
    return id;
  }
);

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: {
    doctors: [],
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
      .addCase(fetchDoctors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.doctors.unshift(action.payload);
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.doctors = state.doctors.filter(doctor => doctor._id !== action.payload);
      });
  },
});

export const { clearError } = doctorsSlice.actions;
export default doctorsSlice.reducer;
