import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("aap-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeState {
  value: Theme;
}

const initialState: ThemeState = { value: getInitialTheme() };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.value = action.payload;
      localStorage.setItem("aap-theme", action.payload);
    },
    toggleTheme(state) {
      state.value = state.value === "light" ? "dark" : "light";
      localStorage.setItem("aap-theme", state.value);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;

export const selectTheme = (state: { theme: ThemeState }) => state.theme.value;
