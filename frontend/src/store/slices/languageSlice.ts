import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Language = "fr" | "en";

function getInitialLanguage(): Language {
  const stored = localStorage.getItem("aap-language");
  if (stored === "fr" || stored === "en") return stored;
  return navigator.language.startsWith("fr") ? "fr" : "en";
}

interface LanguageState {
  value: Language;
}

const initialState: LanguageState = { value: getInitialLanguage() };

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.value = action.payload;
      localStorage.setItem("aap-language", action.payload);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;

export const selectLanguage = (state: { language: LanguageState }) => state.language.value;
