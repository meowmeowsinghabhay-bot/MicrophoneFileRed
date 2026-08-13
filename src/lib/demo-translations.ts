/** Dummy Hindi for seeded demo lectures — fixes [HI] placeholder rows without re-seeding. */
export const DEMO_HI_TRANSLATIONS: Record<string, string> = {
  // BST
  "Welcome to today's lecture on binary search trees.":
    "बाइनरी सर्च टrees पर आज के व्याख्यान में आपका स्वागत है।",
  "A binary search tree is a hierarchical data structure.":
    "बाइनरी सर्च टree एक पदानुक्रमित डेटा संरचना है।",
  "Each node has at most two children — left and right.":
    "प्रत्येक नोड के अधिकतम दो बच्चे होते हैं — बाएँ और दाएँ।",
  "The ordering property: left subtree values are less than the node.":
    "क्रमबद्धता: बाएँ subtree के मान नोड से छोटे होते हैं।",
  "Right subtree values are greater than the node.":
    "दाएँ subtree के मान नोड से बड़े होते हैं।",
  "This is important — remember the ordering property.":
    "यह महत्वपूर्ण है — क्रमबद्धता गुण याद रखें।",
  "In-order traversal gives sorted output.":
    "इन-ऑर्डर ट्रैवर्सल sorted आउटपुट देता है।",
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
  // Sorting
  "Today we cover sorting algorithms and their time complexities.":
    "आज हम sorting algorithms और उनकी time complexities पढ़ेंगे।",
  "Merge sort uses divide and conquer with O(n log n) time.":
    "Merge sort divide and conquer use करता है, समय जटिलता O(n log n)।",
  "Quick sort picks a pivot and partitions the array.":
    "Quick sort एक pivot चुनता है और array को partition करता है।",
  "This is important — quick sort average case is O(n log n).":
    "यह महत्वपूर्ण है — quick sort average case O(n log n) है।",
  "Worst case quick sort is O(n squared) with bad pivot choice.":
    "Worst case quick sort bad pivot choice पर O(n²) होता है।",
  "Merge sort is stable; quick sort is generally not stable.":
    "Merge sort stable है; quick sort आमतौर पर stable नहीं होता।",
  "Space complexity of merge sort is O(n) due to auxiliary array.":
    "Merge sort की space complexity auxiliary array के कारण O(n) है।",
  // SQL
  "Welcome to database management systems.":
    "डेटाबेस management systems में आपका स्वागत है।",
  "SQL is the standard language for relational databases.":
    "SQL relational databases की standard language है।",
  "SELECT statement retrieves data from one or more tables.":
    "SELECT statement एक या अधिक tables से data retrieve करता है।",
  "INNER JOIN returns rows with matching values in both tables.":
    "INNER JOIN दोनों tables में matching values वाली rows return करता है।",
  "This is important — remember LEFT JOIN keeps all left table rows.":
    "यह महत्वपूर्ण है — LEFT JOIN सभी left table rows रखता है।",
  "GROUP BY aggregates data with COUNT, SUM, AVG functions.":
    "GROUP BY COUNT, SUM, AVG functions से data aggregate करता है।",
  "First normal form eliminates repeating groups.":
    "First normal form repeating groups को eliminate करता है।",
  // OS
  "Operating systems manage processes and CPU allocation.":
    "Operating systems processes और CPU allocation manage करते हैं।",
  "FCFS is the simplest scheduling — first come first served.":
    "FCFS सबसे simple scheduling है — first come first served।",
  "Round Robin uses a time quantum for fair scheduling.":
    "Round Robin fair scheduling के लिए time quantum use करता है।",
  "Context switch saves and restores process state.":
    "Context switch process state save और restore करता है।",
  "This might come in the exam — convoy effect in FCFS.":
    "यह exam में आ सकता है — FCFS में convoy effect।",
  // Networks
  "The OSI model has seven layers of network communication.":
    "OSI model में network communication की सात layers होती हैं।",
  "TCP is connection-oriented and reliable.":
    "TCP connection-oriented और reliable है।",
  "UDP is connectionless and faster but unreliable.":
    "UDP connectionless और faster है पर unreliable।",
  "IP addresses identify hosts on a network.":
    "IP addresses network पर hosts को identify करते हैं।",
  // Graphs
  "Graphs consist of vertices and edges.":
    "Graphs vertices और edges से बने होते हैं।",
  "BFS explores level by level using a queue.":
    "BFS queue use करके level by level explore करता है।",
};

export function demoHindiForSegment(sourceText: string): string | undefined {
  return DEMO_HI_TRANSLATIONS[sourceText.trim()];
}

export function seedTranslateToHindi(text: string): string {
  return DEMO_HI_TRANSLATIONS[text] ?? `[HI] ${text}`;
}
