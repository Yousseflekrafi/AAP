import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/auth";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authLoading(state) {
      state.status = "loading";
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    clearUser(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { authLoading, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectIsAdmin = (state: { auth: AuthState }) =>
  !!state.auth.user &&
  (state.auth.user.is_superuser || state.auth.user.roles.includes("admin") || state.auth.user.roles.includes("super_admin"));
export const selectIsSuperAdmin = (state: { auth: AuthState }) =>
  !!state.auth.user && (state.auth.user.is_superuser || state.auth.user.roles.includes("super_admin"));
