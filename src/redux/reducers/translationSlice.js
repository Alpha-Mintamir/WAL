import config from "@/utils/Langconfig";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentLanguage: config.defaultLanguage, // Store the entire default language object
  translations: {}, // Ensure this is initialized
};

const translationSlice = createSlice({
  name: "translation",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload; // Store the entire language object
    },
    setTranslations: (state, action) => {
      state.translations = action.payload; // Store translations
    },
  },
});

export const { setLanguage, setTranslations } = translationSlice.actions;
export default translationSlice.reducer;