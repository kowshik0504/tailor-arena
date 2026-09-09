import { useSyncExternalStore } from "react";
import type { Role } from "./role";

const KEY = "ta_role";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getStoredRole(): Role | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "tailor" || v === "customer" || v === "admin" ? v : null;
}

export function setStoredRole(role: Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, role);
  emit();
}

export function clearStoredRole() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  emit();
}

export function useStoredRole(): Role | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => getStoredRole(),
    () => null,
  );
}

export const roleHomePath: Record<Role, string> = {
  tailor: "/dashboard",
  customer: "/customer",
  admin: "/admin/dashboard",
};
