"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function DashboardRedirect() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/");
    else if (user.role === "teacher") router.replace("/teacher/dashboard");
    else router.replace("/student/dashboard");
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-app text-app-muted">
      Redirecting…
    </div>
  );
}
