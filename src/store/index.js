// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice.js";
import salesSlice from "./slices/salesSlice.js";
import remainsSlice from "./slices/remainsSlice.js";
import doctorsSlice from "./slices/doctorsSlice.js";
import suppliersSlice from "./slices/suppliersSlice.js";
import messagesSlice from "./slices/messagesSlice.js";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    sales: salesSlice,
    remains: remainsSlice,
    doctors: doctorsSlice,
    suppliers: suppliersSlice,
    messages: messagesSlice,
  },
});
