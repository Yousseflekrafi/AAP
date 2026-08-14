import type { User } from "../types/auth";

export function isUserAdmin(user: User): boolean {
  return user.is_superuser || user.roles.includes("admin") || user.roles.includes("super_admin");
}

export function postLoginPath(user: User): string {
  return isUserAdmin(user) ? "/admin" : "/dashboard";
}
