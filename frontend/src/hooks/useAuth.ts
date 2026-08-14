import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  authLoading,
  clearUser,
  selectAuthStatus,
  selectCurrentUser,
  selectIsAdmin,
  selectIsSuperAdmin,
  setUser,
} from "../store/slices/authSlice";
import * as authService from "../services/authService";
import type { LoginPayload } from "../types/auth";

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const status = useAppSelector(selectAuthStatus);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);

  useEffect(() => {
    if (status !== "idle") return;
    dispatch(authLoading());
    authService.tryRestoreSession().then((restoredUser) => {
      if (restoredUser) dispatch(setUser(restoredUser));
      else dispatch(clearUser());
    });
  }, [status, dispatch]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { user: loggedInUser } = await authService.login(payload);
      dispatch(setUser(loggedInUser));
      return loggedInUser;
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch(clearUser());
  }, [dispatch]);

  return { user, status, isAdmin, isSuperAdmin, isAuthenticated: status === "authenticated", login, logout };
}
