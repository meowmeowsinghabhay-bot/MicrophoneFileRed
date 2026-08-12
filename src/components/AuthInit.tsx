"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/** Clears invalid persisted sessions (e.g. old demo id) on app load. */
export default function AuthInit() {
  const clearStaleSession = useAuthStore((s) => s.clearStaleSession);

  useEffect(() => {
    clearStaleSession();
  }, [clearStaleSession]);

  return null;
}
