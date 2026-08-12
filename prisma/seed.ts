import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.quizAttempt.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.lectureProgress.deleteMany();
  await prisma.contentBlock.deleteMany();
  await prisma.transcriptSegment.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.idCounter.deleteMany();

  const teacher = await prisma.user.create({
    data: {
      readableId: "TCH-2026-00001",
      username: "teacher",
      password: "teacher123",
      role: "teacher",
      displayName: "Dr. Sharma",
    },
  });

  const student = await prisma.user.create({
    data: {
      readableId: "STU-2026-00001",
      username: "student",
      password: "student123",
      role: "student",
      displayName: "Priya Patel",
    },
  });

  const course = await prisma.course.create({
    data: {
      name: "Data Structures & Algorithms",
      code: "CS201",
      semester: "Spring 2026",
      description: "Introduction to trees, graphs, and algorithmic thinking.",
      joinCode: "DSA26X",
      teacherId: teacher.id,
    },
  });

  await prisma.enrollment.create({
    data: { studentId: student.id, courseId: course.id },
  });

  const lecture = await prisma.lecture.create({
    data: {
      courseId: course.id,
      title: "Introduction to Binary Search Trees",
      description: "Demo lecture with sample transcript and AI-generated materials.",
      published: true,
      isDemo: true,
      durationMs: 1800000,
    },
  });

  const demoSegments = [
    { text: "Welcome to today's lecture on binary search trees.", startMs: 0, endMs: 5000, isImportant: false },
    { text: "A binary search tree is a hierarchical data structure.", startMs: 5000, endMs: 12000, isImportant: true },
    { text: "Each node has at most two children — left and right.", startMs: 12000, endMs: 18000, isImportant: false },
    { text: "This is important — remember the ordering property.", startMs: 18000, endMs: 24000, isImportant: true },
    { text: "In-order traversal gives sorted output.", startMs: 24000, endMs: 30000, isImportant: false },
  ];

  for (let i = 0; i < demoSegments.length; i++) {
    const s = demoSegments[i];
    await prisma.transcriptSegment.create({
      data: {
        lectureId: lecture.id,
        text: s.text,
        translatedText: i === 0 ? "बाइनरी सर्च टrees पर आज का व्याख्यान में आपका स्वागत है।" : undefined,
        startMs: s.startMs,
        endMs: s.endMs,
        isImportant: s.isImportant,
        orderIndex: i,
      },
    });
  }

  await prisma.contentBlock.createMany({
    data: [
      {
        lectureId: lecture.id,
        type: "notes",
        status: "Teacher Approved",
        content: "## Binary Search Trees\n\n- Hierarchical structure with at most 2 children per node\n- **Left subtree** < node < **Right subtree**\n- In-order traversal → sorted sequence\n- Common operations: insert, search, delete — O(h) height-dependent",
      },
      {
        lectureId: lecture.id,
        type: "mindmap",
        status: "AI Generated",
        content: "# Binary Search Trees\n## Properties\n### Ordering\n### Height\n## Operations\n### Insert\n### Search\n### Delete\n## Traversals\n### In-order\n### Pre-order",
      },
      {
        lectureId: lecture.id,
        type: "revision",
        status: "AI Generated",
        content: "- BST: left < node < right\n- In-order = sorted\n- Operations O(h)\n- Remember ordering property for exams",
      },
    ],
  });

  await prisma.lectureProgress.create({
    data: {
      studentId: student.id,
      lectureId: lecture.id,
      lastPositionMs: 12000,
      completed: false,
    },
  });

  await prisma.quizAttempt.create({
    data: {
      studentId: student.id,
      lectureId: lecture.id,
      score: 75,
      total: 4,
      answers: JSON.stringify([{ q: 1, correct: true }, { q: 2, correct: false }]),
    },
  });

  console.log("Seed complete:");
  console.log("  Teacher: teacher / teacher123 (TCH-2026-00001)");
  console.log("  Student: student / student123 (STU-2026-00001)");
  console.log("  Join code: DSA26X");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
