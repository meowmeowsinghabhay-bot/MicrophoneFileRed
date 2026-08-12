import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Ensure a student is enrolled in all existing courses (matches local seed behavior). */
export async function ensureStudentEnrollments(
  studentId: string,
  client: PrismaClient = prisma
): Promise<number> {
  const existing = await client.enrollment.count({ where: { studentId } });
  if (existing > 0) return existing;

  const courses = await client.course.findMany({ select: { id: true } });
  if (courses.length === 0) return 0;

  for (const course of courses) {
    await client.enrollment.upsert({
      where: { studentId_courseId: { studentId, courseId: course.id } },
      create: { studentId, courseId: course.id },
      update: {},
    });
  }

  return courses.length;
}

/** Repair missing enrollments for all demo students without wiping data. */
export async function repairAllStudentEnrollments(
  client: PrismaClient = prisma
): Promise<{ students: number; enrollments: number }> {
  const students = await client.user.findMany({
    where: { role: "student" },
    select: { id: true },
  });
  const courses = await client.course.findMany({ select: { id: true } });
  let created = 0;

  for (const student of students) {
    for (const course of courses) {
      const row = await client.enrollment.upsert({
        where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
        create: { studentId: student.id, courseId: course.id },
        update: {},
      });
      if (row) created++;
    }
  }

  const enrollments = await client.enrollment.count();
  return { students: students.length, enrollments };
}
