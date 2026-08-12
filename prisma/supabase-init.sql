CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "readableId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "description" TEXT,
    "joinCode" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Lecture" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TranscriptSegment" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "translatedText" TEXT,
    "startMs" INTEGER NOT NULL,
    "endMs" INTEGER NOT NULL,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isManualFlag" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,
    CONSTRAINT "TranscriptSegment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ContentBlock" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AI Generated',
    "language" TEXT NOT NULL DEFAULT 'en',
    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Bookmark" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "segmentId" TEXT,
    "label" TEXT NOT NULL,
    "timestampMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "QuizAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "total" INTEGER NOT NULL,
    "answers" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LectureProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "lastPositionMs" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LectureProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "IdCounter" (
    "prefix" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "IdCounter_pkey" PRIMARY KEY ("prefix")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_readableId_key" ON "User"("readableId");

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

CREATE UNIQUE INDEX IF NOT EXISTS "Course_joinCode_key" ON "Course"("joinCode");

CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_studentId_courseId_key" ON "Enrollment"("studentId", "courseId");

CREATE UNIQUE INDEX IF NOT EXISTS "LectureProgress_studentId_lectureId_key" ON "LectureProgress"("studentId", "lectureId");

ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TranscriptSegment" ADD CONSTRAINT "TranscriptSegment_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LectureProgress" ADD CONSTRAINT "LectureProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LectureProgress" ADD CONSTRAINT "LectureProgress_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
