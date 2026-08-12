"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLectureStore } from "@/store/lectureStore";

interface CourseOption {
  id: string;
  name: string;
  code: string;
}

export default function CourseSelector() {
  const user = useAuthStore((s) => s.user);
  const selectedCourseId = useLectureStore((s) => s.selectedCourseId);
  const setSelectedCourseId = useLectureStore((s) => s.setSelectedCourseId);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  useEffect(() => {
    if (!user || user.role !== "teacher" || user.id === "demo") return;

    fetch(`/api/courses?teacherId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        const list: CourseOption[] = (data.courses || []).map(
          (c: { id: string; name: string; code: string }) => ({
            id: c.id,
            name: c.name,
            code: c.code,
          })
        );
        setCourses(list);
        if (!selectedCourseId && list.length > 0) {
          setSelectedCourseId(list[0].id);
        }
      })
      .catch(() => {
        /* keep empty */
      });
  }, [user, selectedCourseId, setSelectedCourseId]);

  if (!user || user.role !== "teacher" || courses.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="course" className="text-xs font-medium text-app-muted">
        Course:
      </label>
      <select
        id="course"
        value={selectedCourseId || ""}
        onChange={(e) => setSelectedCourseId(e.target.value || null)}
        className="max-w-[180px] rounded-lg border border-app bg-app-card px-2 py-1.5 text-xs font-medium text-app outline-none focus:border-brand-500"
      >
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.code})
          </option>
        ))}
      </select>
    </div>
  );
}
