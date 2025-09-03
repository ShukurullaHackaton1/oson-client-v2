import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// Fetch all messages
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async () => {
    const response = await api.get("/messages");
    return response.data.data;
  }
);

// Fetch doctors for messaging
export const fetchDoctorsForMessaging = createAsyncThunk(
  "messages/fetchDoctorsForMessaging",
  async () => {
    const response = await api.get("/messages/doctors");
    return response.data.data;
  }
);

// Send message to doctors
export const sendMessageToDoctors = createAsyncThunk(
  "messages/sendMessageToDoctors",
  async ({ content, doctorIds }) => {
    const response = await api.post("/messages/send", { content, doctorIds });
    return response.data.data;
  }
);

// Fetch messages for specific doctor
export const fetchDoctorMessages = createAsyncThunk(
  "messages/fetchDoctorMessages",
  async (doctorId) => {
    const response = await api.get(`/messages/doctor/${doctorId}`);
    return response.data.data;
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    doctorsForMessaging: [],
    doctorMessages: [],
    isLoading: false,
    isSending: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDoctorMessages: (state) => {
      state.doctorMessages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Fetch doctors for messaging
      .addCase(fetchDoctorsForMessaging.fulfilled, (state, action) => {
        state.doctorsForMessaging = action.payload;
      })

      // Send message
      .addCase(sendMessageToDoctors.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessageToDoctors.fulfilled, (state, action) => {
        state.isSending = false;
        // Add new message to the beginning of the list
        state.messages.unshift(action.meta.arg);
      })
      .addCase(sendMessageToDoctors.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.error.message;
      })

      // Fetch doctor messages
      .addCase(fetchDoctorMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDoctorMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctorMessages = action.payload;
      })
      .addCase(fetchDoctorMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, clearDoctorMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
