import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HI: Record<string, string> = {
  "Welcome to today's lecture on binary search trees.":
    "बाइनरी सर्च टrees पर आज के व्याख्यान में आपका स्वागत है।",
  "A binary search tree is a hierarchical data structure.":
    "बाइनरी सर्च टree एक पदानुक्रमित डेटा संरचना है।",
  "Each node has at most two children — left and right.":
    "प्रत्येक नोड के अधिकतम दो बच्चे होते हैं — बाएँ और दाएँ।",
  "This is important — remember the ordering property.":
    "यह महत्वपूर्ण है — क्रमबद्धता गुण याद रखें।",
  "In-order traversal gives sorted output.":
    "इन-ऑर्डर ट्रैवर्सल sorted आउटपुट देता है।",
  "The ordering property: left subtree values are less than the node.":
    "क्रमबद्धता: बाएँ subtree के मान नोड से छोटे होते हैं।",
  "Right subtree values are greater than the node.":
    "दाएँ subtree के मान नोड से बड़े होते हैं।",
  "Insert operation: compare and go left or right recursively.":
    "Insert: compare करें और recursively बाएँ या दाएँ जाएँ।",
  "Search operation follows the same comparison logic.":
    "Search भी वही comparison logic follow करता है।",
  "Delete has three cases — leaf, one child, two children.":
    "Delete के तीन cases — leaf, एक child, दो children।",
  "This might come in the exam — worst case height is O(n) for skewed trees.":
    "यह exam में आ सकता है — skewed tree में worst case height O(n) है।",
  "Balanced BSTs like AVL trees maintain O(log n) height.":
    "AVL जैसे balanced BSTs O(log n) height maintain करते हैं।",
  "Time complexity for search in balanced BST is O(log n).":
    "Balanced BST में search की time complexity O(log n) है।",
};

function translate(text: string): string {
  return HI[text] || `[HI] ${text}`;
}

async function createLecture(
  courseId: string,
  data: {
    title: string;
    description: string;
    durationMs: number;
    published: boolean;
    segments: { text: string; startMs: number; endMs: number; isImportant?: boolean; isManualFlag?: boolean }[];
    blocks: { type: string; content: string; status?: string }[];
  }
) {
  const lecture = await prisma.lecture.create({
    data: {
      courseId,
      title: data.title,
      description: data.description,
      published: data.published,
      isDemo: true,
      durationMs: data.durationMs,
    },
  });

  for (let i = 0; i < data.segments.length; i++) {
    const s = data.segments[i];
    await prisma.transcriptSegment.create({
      data: {
        lectureId: lecture.id,
        text: s.text,
        translatedText: translate(s.text),
        startMs: s.startMs,
        endMs: s.endMs,
        isImportant: s.isImportant ?? false,
        isManualFlag: s.isManualFlag ?? false,
        orderIndex: i,
      },
    });
  }

  for (const block of data.blocks) {
    await prisma.contentBlock.create({
      data: {
        lectureId: lecture.id,
        type: block.type,
        content: block.content,
        status: block.status || "AI Generated",
      },
    });
  }

  return lecture;
}

export async function runSeed() {
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
      displayName: "Dr. Ananya Sharma",
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: { readableId: "STU-2026-00001", username: "student", password: "student123", role: "student", displayName: "Priya Patel" },
    }),
    prisma.user.create({
      data: { readableId: "STU-2026-00002", username: "student2", password: "student123", role: "student", displayName: "Rahul Mehta" },
    }),
    prisma.user.create({
      data: { readableId: "STU-2026-00003", username: "student3", password: "student123", role: "student", displayName: "Sneha Reddy" },
    }),
    prisma.user.create({
      data: { readableId: "STU-2026-00004", username: "student4", password: "student123", role: "student", displayName: "Arjun Singh" },
    }),
  ]);

  const courses = await Promise.all([
    prisma.course.create({
      data: {
        name: "Data Structures & Algorithms",
        code: "CS201",
        semester: "Spring 2026",
        description: "Trees, graphs, sorting, and algorithmic complexity.",
        joinCode: "DSA26X",
        teacherId: teacher.id,
      },
    }),
    prisma.course.create({
      data: {
        name: "Database Management Systems",
        code: "CS301",
        semester: "Spring 2026",
        description: "SQL, normalization, indexing, and transactions.",
        joinCode: "DBMS42",
        teacherId: teacher.id,
      },
    }),
    prisma.course.create({
      data: {
        name: "Computer Networks",
        code: "CS401",
        semester: "Spring 2026",
        description: "OSI model, TCP/IP, routing, and network security.",
        joinCode: "NET7K9",
        teacherId: teacher.id,
      },
    }),
    prisma.course.create({
      data: {
        name: "Operating Systems",
        code: "CS302",
        semester: "Spring 2026",
        description: "Processes, memory management, scheduling, and deadlocks.",
        joinCode: "OS88P1",
        teacherId: teacher.id,
      },
    }),
  ]);

  for (const student of students) {
    for (const course of courses) {
      await prisma.enrollment.create({ data: { studentId: student.id, courseId: course.id } });
    }
  }

  const quizJson = JSON.stringify([
    { type: "short", question: "What is the ordering property of a BST?", hint: "Think left vs right" },
    { type: "short", question: "What traversal gives sorted output?", hint: "Three types exist" },
    { type: "long", question: "Explain the three cases of BST deletion with examples.", hint: "Leaf, one child, two children" },
    { type: "long", question: "Compare time complexity of search in balanced vs skewed BST.", hint: "O(log n) vs O(n)" },
  ]);

  const importantJson = JSON.stringify([
    "This is important — remember the ordering property.",
    "This might come in the exam — worst case height is O(n) for skewed trees.",
    "Balanced BSTs like AVL trees maintain O(log n) height.",
  ]);

  const bstLecture = await createLecture(courses[0].id, {
    title: "Lecture 1: Introduction to Binary Search Trees",
    description: "BST properties, traversals, and basic operations.",
    durationMs: 2400000,
    published: true,
    segments: [
      { text: "Welcome to today's lecture on binary search trees.", startMs: 0, endMs: 6000 },
      { text: "A binary search tree is a hierarchical data structure.", startMs: 6000, endMs: 14000, isImportant: true },
      { text: "Each node has at most two children — left and right.", startMs: 14000, endMs: 20000 },
      { text: "The ordering property: left subtree values are less than the node.", startMs: 20000, endMs: 28000 },
      { text: "Right subtree values are greater than the node.", startMs: 28000, endMs: 34000 },
      { text: "This is important — remember the ordering property.", startMs: 34000, endMs: 40000, isImportant: true, isManualFlag: true },
      { text: "In-order traversal gives sorted output.", startMs: 40000, endMs: 46000 },
      { text: "Insert operation: compare and go left or right recursively.", startMs: 55000, endMs: 63000 },
      { text: "Search operation follows the same comparison logic.", startMs: 63000, endMs: 70000 },
      { text: "Delete has three cases — leaf, one child, two children.", startMs: 78000, endMs: 86000, isImportant: true },
      { text: "This might come in the exam — worst case height is O(n) for skewed trees.", startMs: 95000, endMs: 104000, isImportant: true },
      { text: "Balanced BSTs like AVL trees maintain O(log n) height.", startMs: 112000, endMs: 120000, isImportant: true },
      { text: "Time complexity for search in balanced BST is O(log n).", startMs: 128000, endMs: 136000 },
    ],
    blocks: [
      {
        type: "notes",
        status: "Teacher Approved",
        content: `## Binary Search Trees (BST)

### Definition
A **Binary Search Tree** is a node-based binary tree where each node has at most two children.

### Ordering Property
- Left subtree values **<** node value
- Right subtree values **>** node value

### Traversals
| Traversal | Order | Use case |
|-----------|-------|----------|
| In-order | Left → Node → Right | **Sorted output** |
| Pre-order | Node → Left → Right | Copy tree |
| Post-order | Left → Right → Node | Delete tree |

### Operations
- **Insert**: O(h) — compare and recurse
- **Search**: O(h) — same logic as insert
- **Delete**: 3 cases (leaf, one child, two children)

### Complexity
- Balanced BST: O(log n)
- Skewed BST: O(n) — **exam important**`,
      },
      {
        type: "simplified",
        status: "AI Generated",
        content: `## BST — Explained Simply

Imagine a family tree where everyone on the left is younger and everyone on the right is older.

- **Rule**: Left side = smaller numbers, Right side = bigger numbers
- **In-order walk**: Visit left, then yourself, then right → you get numbers in order!
- **Finding a number**: Start at top, go left if too big, go right if too small
- **Deleting**: Easy if no kids, harder if two kids (replace with successor)`,
      },
      {
        type: "mindmap",
        content: `# Binary Search Trees
## Properties
### Ordering Property
### Max 2 Children
## Operations
### Insert O(h)
### Search O(h)
### Delete (3 cases)
## Traversals
### In-order → Sorted
### Pre-order
### Post-order
## Complexity
### Balanced O(log n)
### Skewed O(n)
## Related
### AVL Trees
### Red-Black Trees`,
      },
      {
        type: "revision",
        content: `- BST: left < node < right
- In-order = sorted output
- Insert/Search/Delete: O(h)
- Skewed tree → O(n) worst case
- Balanced (AVL): O(log n)
- Delete cases: leaf | 1 child | 2 children
- **Exam**: ordering property + complexity`,
      },
      {
        type: "formulas",
        content: `## Key Formulas & Complexity

**Search time (balanced):**
$$T(n) = O(\\log n)$$

**Search time (skewed):**
$$T(n) = O(n)$$

**Height of balanced BST:**
$$h = \\lfloor \\log_2 n \\rfloor$$

**In-order traversal pseudocode:**
\`\`\`
inorder(node):
  if node is null: return
  inorder(node.left)
  print(node.val)
  inorder(node.right)
\`\`\``,
      },
      {
        type: "concepts",
        content: `## Key Concepts

1. **Binary Search Tree** — ordered binary tree for efficient search
2. **Ordering Property** — core invariant that makes BST work
3. **Tree Height (h)** — longest path from root to leaf; drives complexity
4. **In-order Traversal** — visits nodes in ascending sorted order
5. **Successor** — smallest value in right subtree; used in deletion
6. **Skewed Tree** — degenerates to linked list; O(n) operations
7. **AVL Tree** — self-balancing BST maintaining O(log n) height`,
      },
      {
        type: "glossary",
        content: JSON.stringify([
          {
            term: "Binary Search Tree",
            definition: "A hierarchical data structure where each node has at most two children and values in the left subtree are smaller than the node.",
            translation: "एक पदानुक्रमित डेटा संरचना जहाँ बाएँ subtree के मान नोड से छोटे होते हैं।",
            category: "concept",
          },
          {
            term: "O(log n)",
            definition: "Logarithmic time complexity — operations grow slowly as input size increases; typical for balanced trees.",
            translation: "लघुगणकीय समय जटिलता — संतुलित tree में खोज की typical complexity।",
            category: "formula",
          },
          {
            term: "In-order Traversal",
            definition: "Visit left subtree, then node, then right subtree — produces sorted output in a BST.",
            translation: "पहले बाएँ, फिर नोड, फिर दाएँ — BST में sorted क्रम देता है।",
            category: "term",
          },
        ]),
        status: "AI Generated",
      },
      {
        type: "board",
        content: `## Board Capture 1 (0:20)
Tree diagram drawn on board:
\`\`\`
       8
      / \\
     3   10
    / \\    \\
   1   6    14
\`\`\`
Labels: root=8, left child=3, right child=10

## Board Capture 2 (1:05)
Deletion cases written:
- Case 1: Leaf node → simply remove
- Case 2: One child → replace with child
- Case 3: Two children → replace with inorder successor

## Board Capture 3 (1:45)
Complexity table:
| Operation | Balanced | Skewed |
|-----------|----------|--------|
| Search    | O(log n) | O(n)   |
| Insert    | O(log n) | O(n)   |
| Delete    | O(log n) | O(n)   |`,
      },
      {
        type: "summary",
        content: `## Catch-Up Summary (from 1:30 onwards)

If you joined late, here's what you missed after the 1:30 mark:
- Delete operation has **three cases** depending on node children
- Skewed trees degrade to O(n) — this is **exam-relevant**
- AVL trees solve skewing by self-balancing to O(log n)
- Practice drawing the three deletion cases on paper`,
      },
      { type: "quiz", content: quizJson },
      { type: "important", content: importantJson },
    ],
  });

  const sortingLecture = await createLecture(courses[0].id, {
    title: "Lecture 2: Sorting Algorithms",
    description: "Merge sort, quick sort, and complexity analysis.",
    durationMs: 2700000,
    published: true,
    segments: [
      { text: "Today we cover sorting algorithms and their time complexities.", startMs: 0, endMs: 7000 },
      { text: "Merge sort uses divide and conquer with O(n log n) time.", startMs: 7000, endMs: 15000, isImportant: true },
      { text: "Quick sort picks a pivot and partitions the array.", startMs: 15000, endMs: 22000 },
      { text: "This is important — quick sort average case is O(n log n).", startMs: 22000, endMs: 29000, isImportant: true },
      { text: "Worst case quick sort is O(n squared) with bad pivot choice.", startMs: 35000, endMs: 42000, isImportant: true },
      { text: "Merge sort is stable; quick sort is generally not stable.", startMs: 50000, endMs: 57000 },
      { text: "Space complexity of merge sort is O(n) due to auxiliary array.", startMs: 65000, endMs: 72000 },
    ],
    blocks: [
      {
        type: "notes",
        status: "Teacher Approved",
        content: `## Sorting Algorithms

### Merge Sort
- Divide and conquer
- Time: **O(n log n)** always
- Space: O(n)
- **Stable**

### Quick Sort
- Pivot-based partitioning
- Average: O(n log n)
- Worst: O(n²)
- In-place: O(log n) stack space`,
      },
      { type: "mindmap", content: `# Sorting\n## O(n log n)\n### Merge Sort\n### Quick Sort\n### Heap Sort\n## O(n²)\n### Bubble Sort\n### Insertion Sort\n## Properties\n### Stability\n### In-place` },
      { type: "revision", content: `- Merge sort: O(n log n), stable, O(n) space\n- Quick sort: avg O(n log n), worst O(n²)\n- Stable = equal elements keep order` },
      { type: "formulas", content: `Merge sort: $$T(n) = 2T(n/2) + O(n) = O(n \\log n)$$\nQuick sort average: $$O(n \\log n)$$` },
      { type: "concepts", content: `- **Stability** — equal keys retain relative order\n- **In-place** — uses O(1) extra space\n- **Pivot** — element for partitioning in quick sort` },
      { type: "board", content: `Merge sort recursion tree drawn with n=8\nPivot selection example: [3,1,4,1,5,9,2,6]` },
      { type: "summary", content: `Late joiners: focus on merge vs quick sort trade-offs for exam.` },
      {
        type: "quiz",
        content: JSON.stringify([
          { type: "short", question: "What is merge sort's time complexity?", hint: "Always the same" },
          { type: "long", question: "When would you prefer merge sort over quick sort?", hint: "Think stability and worst case" },
        ]),
      },
      { type: "important", content: JSON.stringify(["Merge sort uses divide and conquer with O(n log n) time.", "This is important — quick sort average case is O(n log n)."]) },
      { type: "simplified", content: `Merge sort = split in half repeatedly, sort, merge back.\nQuick sort = pick a pivot, put smaller on left, bigger on right, repeat.` },
    ],
  });

  const sqlLecture = await createLecture(courses[1].id, {
    title: "Lecture 1: SQL Fundamentals & Joins",
    description: "SELECT, JOIN, GROUP BY, and normalization basics.",
    durationMs: 2100000,
    published: true,
    segments: [
      { text: "Welcome to database management systems.", startMs: 0, endMs: 5000 },
      { text: "SQL is the standard language for relational databases.", startMs: 5000, endMs: 12000 },
      { text: "SELECT statement retrieves data from one or more tables.", startMs: 12000, endMs: 19000 },
      { text: "INNER JOIN returns rows with matching values in both tables.", startMs: 25000, endMs: 33000, isImportant: true },
      { text: "This is important — remember LEFT JOIN keeps all left table rows.", startMs: 33000, endMs: 41000, isImportant: true },
      { text: "GROUP BY aggregates data with COUNT, SUM, AVG functions.", startMs: 48000, endMs: 56000 },
      { text: "First normal form eliminates repeating groups.", startMs: 65000, endMs: 72000, isImportant: true },
    ],
    blocks: [
      { type: "notes", status: "Teacher Approved", content: `## SQL Fundamentals\n\n### SELECT\n\`\`\`sql\nSELECT col1, col2 FROM table WHERE condition;\n\`\`\`\n\n### JOINs\n- **INNER JOIN**: matching rows only\n- **LEFT JOIN**: all left + matching right\n- **RIGHT JOIN**: all right + matching left\n\n### Normalization\n- 1NF: no repeating groups\n- 2NF: no partial dependencies\n- 3NF: no transitive dependencies` },
      { type: "mindmap", content: `# SQL\n## DML\n### SELECT\n### INSERT\n### UPDATE\n## Joins\n### INNER\n### LEFT\n### RIGHT\n## Normalization\n### 1NF\n### 2NF\n### 3NF` },
      { type: "formulas", content: `COUNT(*), SUM(col), AVG(col)\nNormalization dependencies diagram on board` },
      { type: "revision", content: `- INNER = intersection\n- LEFT = keep all left\n- 1NF = atomic values\n- GROUP BY + aggregates` },
      { type: "concepts", content: `- Primary key, foreign key, join condition\n- Aggregate functions\n- Functional dependency` },
      { type: "board", content: `ER diagram: Student — enrolls — Course\nJOIN example with two tables on student_id` },
      { type: "quiz", content: JSON.stringify([{ type: "short", question: "Difference between INNER and LEFT JOIN?", hint: "What rows are kept?" }]) },
      { type: "important", content: JSON.stringify(["INNER JOIN returns rows with matching values in both tables.", "First normal form eliminates repeating groups."]) },
      { type: "simplified", content: `SQL = asking the database questions.\nJOIN = combining two spreadsheets on a common column.` },
      { type: "summary", content: `Missed the start? JOINs are the exam focus — practice INNER vs LEFT.` },
    ],
  });

  const osLecture = await createLecture(courses[3].id, {
    title: "Lecture 1: Process Scheduling",
    description: "FCFS, SJF, Round Robin, and context switching.",
    durationMs: 1800000,
    published: true,
    segments: [
      { text: "Operating systems manage processes and CPU allocation.", startMs: 0, endMs: 7000 },
      { text: "FCFS is the simplest scheduling — first come first served.", startMs: 7000, endMs: 14000 },
      { text: "Round Robin uses a time quantum for fair scheduling.", startMs: 14000, endMs: 21000, isImportant: true },
      { text: "Context switch saves and restores process state.", startMs: 28000, endMs: 35000 },
      { text: "This might come in the exam — convoy effect in FCFS.", startMs: 35000, endMs: 42000, isImportant: true },
    ],
    blocks: [
      { type: "notes", status: "Teacher Edited", content: `## Process Scheduling\n\n| Algorithm | Type | Pros | Cons |\n|-----------|------|------|------|\n| FCFS | Non-preemptive | Simple | Convoy effect |\n| SJF | Optimal avg wait | Min wait time | Starvation |\n| Round Robin | Preemptive | Fair | Overhead |` },
      { type: "mindmap", content: `# Scheduling\n## Non-preemptive\n### FCFS\n### SJF\n## Preemptive\n### Round Robin\n### Priority\n## Metrics\n### Turnaround\n### Waiting\n### Response` },
      { type: "revision", content: `- FCFS: convoy effect\n- RR: time quantum q\n- Context switch overhead` },
      { type: "formulas", content: `Turnaround Time = Completion - Arrival\nWaiting Time = Turnaround - Burst` },
      { type: "quiz", content: JSON.stringify([{ type: "short", question: "What is convoy effect?", hint: "FCFS + one long process" }]) },
      { type: "important", content: JSON.stringify(["Round Robin uses a time quantum for fair scheduling.", "This might come in the exam — convoy effect in FCFS."]) },
      { type: "concepts", content: `- Process vs thread\n- Ready queue\n- Time quantum` },
      { type: "board", content: `Gantt chart for RR with q=4\nProcess timeline: P1, P2, P3` },
      { type: "simplified", content: `FCFS = queue at a shop. Round Robin = everyone gets a fixed time slice.` },
      { type: "summary", content: `Focus on Gantt chart problems for exam prep.` },
    ],
  });

  const networkLecture = await createLecture(courses[2].id, {
    title: "Lecture 1: OSI Model & TCP/IP",
    description: "Seven layers, encapsulation, and protocol stack.",
    durationMs: 1500000,
    published: true,
    segments: [
      { text: "The OSI model has seven layers of network communication.", startMs: 0, endMs: 8000, isImportant: true },
      { text: "TCP is connection-oriented and reliable.", startMs: 8000, endMs: 15000 },
      { text: "UDP is connectionless and faster but unreliable.", startMs: 15000, endMs: 22000 },
      { text: "IP addresses identify hosts on a network.", startMs: 28000, endMs: 34000 },
    ],
    blocks: [
      { type: "notes", status: "AI Generated", content: `## OSI Model\n\n7. Application\n6. Presentation\n5. Session\n4. Transport (TCP/UDP)\n3. Network (IP)\n2. Data Link\n1. Physical` },
      { type: "mindmap", content: `# Networking\n## OSI Layers\n## TCP/IP\n### TCP\n### UDP\n## Addressing\n### IPv4\n### IPv6` },
      { type: "revision", content: `- OSI = 7 layers\n- TCP = reliable\n- UDP = fast, no guarantee` },
      { type: "quiz", content: JSON.stringify([{ type: "short", question: "TCP vs UDP?", hint: "Reliability" }]) },
      { type: "formulas", content: `IPv4: 32-bit address\nSubnet mask calculation` },
      { type: "concepts", content: `- Encapsulation\n- Port numbers\n- Three-way handshake` },
      { type: "board", content: `OSI layer diagram with examples per layer` },
      { type: "important", content: JSON.stringify(["The OSI model has seven layers of network communication."]) },
      { type: "simplified", content: `OSI = 7-step checklist for sending data across networks.` },
      { type: "summary", content: `Memorize OSI layer order and one protocol per layer.` },
    ],
  });

  const draftLecture = await createLecture(courses[0].id, {
    title: "Lecture 3: Graph Algorithms (Draft)",
    description: "BFS, DFS, Dijkstra — not yet published.",
    durationMs: 900000,
    published: false,
    segments: [
      { text: "Graphs consist of vertices and edges.", startMs: 0, endMs: 6000 },
      { text: "BFS explores level by level using a queue.", startMs: 6000, endMs: 13000 },
    ],
    blocks: [
      { type: "notes", content: `## Graph Algorithms (Draft)\n\n- BFS: queue-based\n- DFS: stack/recursion\n- Dijkstra: shortest path`, status: "AI Generated" },
      { type: "mindmap", content: `# Graphs\n## Traversal\n### BFS\n### DFS\n## Shortest Path\n### Dijkstra` },
    ],
  });

  const allPublishedLectures = [bstLecture, sortingLecture, sqlLecture, osLecture, networkLecture];

  for (const student of students) {
    for (const lecture of allPublishedLectures) {
      const completed = student.readableId === "STU-2026-00002" && lecture.id === bstLecture.id;
      await prisma.lectureProgress.create({
        data: {
          studentId: student.id,
          lectureId: lecture.id,
          lastPositionMs: completed ? lecture.durationMs! : Math.floor(lecture.durationMs! * 0.4),
          completed,
          lastActive: new Date(Date.now() - Math.random() * 7 * 86400000),
        },
      });

      await prisma.quizAttempt.create({
        data: {
          studentId: student.id,
          lectureId: lecture.id,
          score: 2 + Math.floor(Math.random() * 3),
          total: 4,
          answers: JSON.stringify([
            { q: 1, correct: true },
            { q: 2, correct: Math.random() > 0.4 },
            { q: 3, correct: Math.random() > 0.5 },
            { q: 4, correct: Math.random() > 0.6 },
          ]),
        },
      });
    }

    await prisma.bookmark.createMany({
      data: [
        { studentId: student.id, lectureId: bstLecture.id, label: "Ordering Property", timestampMs: 34000 },
        { studentId: student.id, lectureId: bstLecture.id, label: "Delete 3 Cases", timestampMs: 78000 },
        { studentId: student.id, lectureId: sortingLecture.id, label: "Merge vs Quick", timestampMs: 22000 },
        { studentId: student.id, lectureId: sqlLecture.id, label: "LEFT JOIN", timestampMs: 33000 },
        { studentId: student.id, lectureId: osLecture.id, label: "Round Robin", timestampMs: 14000 },
      ],
    });
  }

  console.log("\n✅ Rich demo seed complete!\n");
  console.log("Logins:");
  console.log("  teacher / teacher123  (TCH-2026-00001)");
  console.log("  student / student123  (STU-2026-00001)");
  console.log("  student2-4 / student123");
  console.log("\nJoin codes: DSA26X | DBMS42 | NET7K9 | OS88P1");
  console.log(`\nLectures: ${allPublishedLectures.length} published + 1 draft`);
  console.log(`Students enrolled in all ${courses.length} courses`);
}

async function main() {
  await runSeed();
}

if (process.argv.some((arg) => arg.replace(/\\/g, "/").includes("prisma/seed.ts"))) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
