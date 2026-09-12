import { useAppSelector } from "../store";
import { selectHasPermission, selectPermissions } from "../store/slices/authSlice";

export function usePermission(permKey: string): boolean {
  return useAppSelector(selectHasPermission(permKey));
}

export function usePermissions(): string[] {
  return useAppSelector(selectPermissions);
}
