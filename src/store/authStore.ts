import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "student" | "teacher";

export interface AuthUser {
  id: string;
  readableId: string;
  username: string;
  role: UserRole;
  displayName: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  setupUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  login: (username: string, password: string, role: UserRole) => Promise<LoginResult>;
  logout: () => void;
  clearStaleSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      login: async (username, password, role) => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role }),
          });
          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            return {
              success: false,
              error: data.error || "Login failed",
              setupUrl: data.setupUrl,
            };
          }

          if (!data.user?.id || data.user.id === "demo") {
            return { success: false, error: "Invalid server response" };
          }

          set({ user: data.user });
          return { success: true };
        } catch {
          return {
            success: false,
            error: "Cannot reach server. Check your connection and try again.",
          };
        }
      },
      logout: () => set({ user: null }),
      clearStaleSession: () => {
        const user = get().user;
        if (!user || user.id === "demo") {
          set({ user: null });
        }
      },
    }),
    {
      name: "smartclass-auth",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as { user?: AuthUser | null };
        if (state.user?.id === "demo") {
          state.user = null;
        }
        return state as AuthState;
      },
    }
  )
);
