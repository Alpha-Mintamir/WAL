import { createSlice, createSelector } from "@reduxjs/toolkit";
import { store } from "../store";

// Initial state
const initialState = {
  activeTab: "services",
  bookingStatus: "all",
  chatData: null,
};

const helperSlice = createSlice({
  name: "helper",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setBookingStatus: (state, action) => {
      state.bookingStatus = action.payload;
    },
    setChatData: (state, action) => {
      state.chatData = action.payload.data;
    },
    clearChatData: (state) => {
      state.chatData = null;
    },
  },
});

export const {
  setActiveTab,
  setBookingStatus,
  setChatData,
  clearChatData,
} = helperSlice.actions;

export const getChatData = (data) => {
  store.dispatch(setChatData({ data }))
}

export default helperSlice.reducer;

// Selectors
export const selectActiveTab = (state) => state.helper.activeTab;
export const selectBookingStatus = (state) => state.helper.bookingStatus;
// Memoized Selector using createSelector (for performance optimization)
export const selectHelperState = createSelector(
  (state) => state.helper,
  (helper) => helper
);