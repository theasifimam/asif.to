import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGODB_URI or MONGO_URI is not set in environment.");
  process.exit(1);
}

const courseData = {
  slug: "dsa-in-javascript",
  title: "Data Structures & Algorithms in JavaScript",
  subtitle:
    "Master data structures, algorithmic thinking, problem-solving patterns, complexity analysis, and coding interview techniques with JavaScript.",
  techId: "javascript",
  level: "Intermediate - Advanced",
  duration: "Self-paced (35+ hours)",
  thumbnail: "",
  learningOutcomes: [
    "Analyze time and space complexity using Big O, Big Omega, and Big Theta notation",
    "Understand JavaScript-specific performance considerations when solving DSA problems",
    "Master arrays, strings, hash maps, sets, linked lists, stacks, queues, trees, heaps, and graphs",
    "Implement common data structures from scratch using modern JavaScript",
    "Use two pointers, sliding window, prefix sums, frequency counters, fast/slow pointers, and monotonic structures",
    "Master recursion, backtracking, divide and conquer, greedy algorithms, and dynamic programming",
    "Implement and compare searching and sorting algorithms with their complexity trade-offs",
    "Solve tree and graph problems using BFS, DFS, topological sorting, and shortest-path techniques",
    "Recognize common coding interview patterns instead of memorizing isolated solutions",
    "Write clean, testable, interview-ready JavaScript solutions and explain their complexity",
  ],
  order: 6,
  status: "published",
  examEnabled: true,
  examSettings: {
    questionCount: 20,
    durationMinutes: 30,
    passingPercentage: 70,
    cooldownHours: 24,
  },
};

const chaptersData = [
  {
    slug: "big-o-notation-and-complexity",
    title: "1. Big O Notation & Complexity Analysis",
    summary:
      "Build a practical understanding of time and space complexity, asymptotic analysis, amortized cost, and JavaScript-specific performance trade-offs.",
    content: [
      "## Why Complexity Analysis Matters",
      "Two solutions can return the same correct result but behave very differently as input grows. Complexity analysis helps us reason about scalability before running the code on huge datasets. Instead of asking only whether a solution works, we ask how the amount of work and memory grow with input size.",
      "## Input Size and Growth Rate",
      "We usually describe input size using `n`. For an array, `n` is commonly the number of elements. For a string, it may be the number of characters. For a graph, complexity is often expressed using `V` for vertices and `E` for edges. The important idea is not the exact number of operations, but how quickly the work grows.",
      "## Big O, Big Omega, and Big Theta",
      "**Big O** describes an asymptotic upper bound, **Big Omega** describes a lower bound, and **Big Theta** describes a tight bound. In coding interviews, Big O is used most often to communicate worst-case or growth-rate complexity, but understanding the distinction prevents sloppy reasoning.",
      "## Common Time Complexities",
      "1. **O(1) — Constant:** direct array index access, object/Map lookup on average.\n2. **O(log n) — Logarithmic:** binary search, repeatedly halving a search space.\n3. **O(n) — Linear:** one full pass through input.\n4. **O(n log n) — Linearithmic:** efficient comparison sorting such as merge sort.\n5. **O(n²) — Quadratic:** many nested-loop comparisons.\n6. **O(2^n) — Exponential:** exploring every include/exclude combination.\n7. **O(n!) — Factorial:** generating every permutation.",
      "## Drop Constants and Lower-Order Terms",
      "Big O focuses on dominant growth. `O(3n + 20)` becomes `O(n)`, and `O(n² + n)` becomes `O(n²)`. This does not mean constants never matter in real software; it means asymptotic notation intentionally abstracts them away.",
      "## Nested Loops Are Not Automatically O(n²)",
      "A nested loop is `O(n²)` only when both loops independently traverse roughly `n` items. Two pointers can contain a loop inside another structure while still moving each pointer at most `n` times, resulting in `O(n)`. Always count total work, not visual nesting.",
      "## Space Complexity",
      "Auxiliary space measures additional memory used by an algorithm beyond the input itself. Creating a frequency map for `n` unique values is `O(n)` extra space. A few counters are `O(1)`. Recursive calls also consume stack space, so a recursion depth of `n` normally contributes `O(n)` auxiliary space.",
      "## Amortized Analysis",
      "Some individual operations can occasionally be expensive while the average cost across many operations remains cheap. Dynamic-array append is a classic example: resizing may cost `O(n)` occasionally, but repeated appends are considered amortized `O(1)`.",
      "## JavaScript Performance Notes",
      "JavaScript arrays are high-level dynamic structures, not raw fixed-size arrays. `push()` and `pop()` are typically efficient, while `shift()` and `unshift()` can require reindexing many elements. `Map` and `Set` are often preferable when the problem is fundamentally about key lookup, membership, or counting.",
      "## Complexity Checklist",
      "For every solution, identify: the input variables, how many times each element can be processed, whether loops are dependent or independent, how much auxiliary memory is created, and whether recursion adds call-stack usage.",
    ],
    codeSnippets: [
      {
        title: "Comparing Common Time Complexities",
        language: "javascript",
        code: `// O(1)
function getFirstElement(arr) {
  return arr[0];
}

// O(n)
function findMax(arr) {
  let max = -Infinity;

  for (const value of arr) {
    if (value > max) max = value;
  }

  return max;
}

// O(n^2)
function hasDuplicateNested(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }

  return false;
}

// O(n) average time, O(n) extra space
function hasDuplicateSet(arr) {
  const seen = new Set();

  for (const value of arr) {
    if (seen.has(value)) return true;
    seen.add(value);
  }

  return false;
}`,
      },
      {
        title: "A Nested-Looking Pattern That Is Still O(n)",
        language: "javascript",
        code: `function removeDuplicatesFromSortedArray(arr) {
  if (arr.length === 0) return 0;

  let write = 1;

  for (let read = 1; read < arr.length; read++) {
    if (arr[read] !== arr[read - 1]) {
      arr[write] = arr[read];
      write++;
    }
  }

  return write;
}

// Each element is read once.
// Time: O(n)
// Extra space: O(1)`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "For three different duplicate-checking solutions—nested loops, sorting first, and using a Set—write the time and space complexity and explain when each approach may still be reasonable.",
    order: 1,
  },
  {
    slug: "arrays-and-string-manipulation",
    title: "2. Arrays, Strings & Core Problem-Solving Patterns",
    summary:
      "Master the highest-value array and string techniques: two pointers, sliding window, prefix sums, frequency counters, and in-place processing.",
    content: [
      "## Why Arrays and Strings Matter",
      "A large percentage of coding interview problems are expressed using arrays or strings even when the real concept being tested is hashing, greedy reasoning, dynamic programming, or pointer movement. Becoming fluent with array and string patterns gives you a reusable toolkit for many later chapters.",
      "## Two-Pointer Technique",
      "Two pointers maintain two positions in the same sequence. They may move toward each other, move in the same direction at different speeds, or represent read/write positions. Common uses include palindrome checking, removing duplicates, partitioning, merging sorted sequences, and pair-sum problems.",
      "## When Two Pointers Works Best",
      "Two pointers is especially powerful when input is sorted, when you need an in-place transformation, or when the answer depends on comparing elements from different positions without restarting a scan.",
      "## Sliding Window",
      "Sliding window is used for contiguous subarrays or substrings. A **fixed-size window** keeps exactly `k` elements. A **variable-size window** expands and shrinks based on a condition such as distinct character count, sum threshold, or duplicate presence.",
      "## Fixed vs Variable Sliding Window",
      "For a fixed-size window, compute the first window once and then update the result by adding the incoming value and removing the outgoing value. For a variable-size window, move the right pointer to expand and the left pointer to restore validity.",
      "## Frequency Counter Pattern",
      "A frequency counter stores how often each value appears. In JavaScript, `Map` is usually the most general choice. Plain objects can also work for controlled string keys. Frequency counters often replace repeated searches and reduce `O(n²)` solutions to `O(n)`.",
      "## Prefix Sums",
      "A prefix sum array stores cumulative totals so range-sum queries become constant time after linear preprocessing. If `prefix[i]` stores the sum of the first `i` values, the sum from index `left` through `right` can be computed using subtraction.",
      "## In-Place Array Modification",
      "Some problems require `O(1)` extra space. Instead of building another array, use read/write pointers or swapping. This is common in remove-element, move-zeroes, partition, and deduplication problems.",
      "## Strings in JavaScript",
      "JavaScript strings are immutable. Methods such as `slice`, `replace`, and concatenation produce new strings. For repeated character-level mutation, converting to an array and joining at the end may be easier to reason about.",
      "## Pattern Selection Guide",
      "Use two pointers for opposite-end or read/write movement; sliding window for contiguous ranges; frequency maps for counts and membership; prefix sums for repeated range totals; sorting when ordering unlocks a simpler scan.",
      "## Common Mistakes",
      "Typical mistakes include moving the wrong pointer, forgetting to remove values when a window shrinks, mishandling repeated characters, using an object when keys may collide with inherited properties, and ignoring whether input order may be modified.",
    ],
    codeSnippets: [
      {
        title: "Two Pointers: Pair Sum in a Sorted Array",
        language: "javascript",
        code: `function twoSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];

    if (sum === target) {
      return [left, right];
    }

    if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [-1, -1];
}

// Time: O(n)
// Space: O(1)`,
      },
      {
        title: "Variable Sliding Window: Longest Unique Substring",
        language: "javascript",
        code: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    if (lastSeen.has(char) && lastSeen.get(char) >= left) {
      left = lastSeen.get(char) + 1;
    }

    lastSeen.set(char, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}

// Time: O(n)
// Space: O(min(n, characterSetSize))`,
      },
      {
        title: "Prefix Sum for Fast Range Queries",
        language: "javascript",
        code: `function buildPrefixSum(arr) {
  const prefix = new Array(arr.length + 1).fill(0);

  for (let i = 0; i < arr.length; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
  }

  return prefix;
}

function rangeSum(prefix, left, right) {
  return prefix[right + 1] - prefix[left];
}

const nums = [2, 4, 1, 7, 3];
const prefix = buildPrefixSum(nums);

console.log(rangeSum(prefix, 1, 3)); // 12`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Implement `minimumWindowSubstring(s, t)` using a variable sliding window and frequency map. Then explain why repeatedly slicing and recounting every candidate window would be slower.",
    order: 2,
  },
  {
    slug: "hash-tables-maps-and-sets",
    title: "3. Hash Tables, Map & Set",
    summary:
      "Understand hashing conceptually and use JavaScript Map and Set effectively for lookup, counting, grouping, deduplication, and index tracking.",
    content: [
      "## What Is a Hash Table?",
      "A hash table stores key-value associations and aims for near constant-time average lookup, insertion, and deletion. Internally, a hash function converts a key into a location or bucket. Different keys may map to the same bucket, so implementations require collision-handling strategies.",
      "## Why Hashing Is Important in Interviews",
      "Hashing frequently converts repeated linear searches into direct membership or lookup checks. This is why problems such as Two Sum, anagrams, duplicate detection, grouping, prefix-sum counting, and caching often have efficient hash-based solutions.",
      "## JavaScript Map",
      "`Map` supports keys of any type, preserves insertion order, exposes a reliable `size`, and avoids prototype-key concerns associated with plain objects. Its API clearly communicates operations such as `set`, `get`, `has`, and `delete`.",
      "## JavaScript Set",
      "`Set` stores unique values and is ideal when you only need membership or deduplication. Typical uses include detecting duplicates, tracking visited graph nodes, or keeping a sliding window unique.",
      "## Map vs Object",
      "Plain objects are still useful when modeling records with known property names or when JSON serialization is central. For algorithmic key-value lookup with dynamic keys, `Map` is often clearer and more predictable.",
      "## Frequency Maps",
      "A frequency map counts how many times each value appears. Many comparison problems become a two-pass solution: build counts from the first input, then consume or compare counts using the second input.",
      "## Index Maps",
      "Sometimes the value we need to store is not a count but an index, last-seen position, or metadata. Two Sum stores a number's index; sliding-window solutions often store each character's most recent index.",
      "## Grouping with Maps",
      "A Map can associate a normalized key with an array of matching items. Group Anagrams is a classic example: derive a canonical signature for each word and group words with the same signature.",
      "## Complexity Nuance",
      "Map and Set operations are treated as `O(1)` average-time in typical interview analysis, but hashing is not magical worst-case constant time in every possible implementation or adversarial situation. For interview reasoning, state the accepted average-time assumption.",
      "## Common Mistakes",
      "Watch for `undefined` as a legitimate stored value, confusing `map[key]` with `map.get(key)`, mutating objects used as keys, and using arrays as Map keys while accidentally creating different array references.",
    ],
    codeSnippets: [
      {
        title: "Two Sum with a Map",
        language: "javascript",
        code: `function twoSum(nums, target) {
  const indexByValue = new Map();

  for (let i = 0; i < nums.length; i++) {
    const needed = target - nums[i];

    if (indexByValue.has(needed)) {
      return [indexByValue.get(needed), i];
    }

    indexByValue.set(nums[i], i);
  }

  return [];
}

// Time: O(n) average
// Space: O(n)`,
      },
      {
        title: "Group Anagrams",
        language: "javascript",
        code: `function groupAnagrams(words) {
  const groups = new Map();

  for (const word of words) {
    const key = [...word].sort().join("");

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(word);
  }

  return [...groups.values()];
}`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Solve `subarraySumEqualsK(nums, k)` in O(n) average time using a running prefix sum and a Map of previously seen prefix-sum frequencies.",
    order: 3,
  },
  {
    slug: "linked-lists-implementation",
    title: "4. Linked Lists: Singly, Doubly & Pointer Techniques",
    summary:
      "Build linked lists from scratch and master pointer operations, reversal, cycle detection, middle-node search, merging, and deletion.",
    content: [
      "## What Is a Linked List?",
      "A linked list stores data in nodes connected by references. Unlike an array, logical neighbors do not need to occupy neighboring memory locations. A singly linked node stores a value and `next`; a doubly linked node also stores `prev`.",
      "## Why Learn Linked Lists in JavaScript?",
      "JavaScript developers rarely implement linked lists for normal application code, but they are excellent for learning references, pointer manipulation, mutation, and complexity trade-offs. Interview problems also use linked lists heavily.",
      "## Core Singly Linked List Operations",
      "Typical operations are `push`, `pop`, `shift`, `unshift`, `get`, `set`, `insert`, `remove`, and `reverse`. Head insertion/removal can be `O(1)`, while locating an arbitrary index requires traversal and is `O(n)`.",
      "## Singly vs Doubly Linked Lists",
      "A doubly linked list uses more memory per node but supports efficient movement in both directions. When you already have a reference to a node, deletion can be simpler because its previous node is directly available.",
      "## Fast and Slow Pointers",
      "The fast/slow pointer pattern uses two references moving at different speeds. It can find the middle node, detect cycles, locate cycle entry points, or split a list for merge sort.",
      "## Reversing a Linked List",
      "Reversal requires carefully preserving the next node before changing a pointer. At every step maintain three references: `prev`, `current`, and `next`. Losing `next` disconnects the remainder of the list.",
      "## Dummy Nodes",
      "A dummy or sentinel node removes edge cases around operations at the head. Merging sorted lists and deleting nodes conditionally become cleaner when the result list always has a stable temporary starting node.",
      "## Cycle Detection",
      "Floyd's Tortoise and Hare algorithm detects a cycle with `O(1)` extra space. If a slow pointer moves one step and a fast pointer moves two, they eventually meet when a cycle exists.",
      "## Complexity",
      "Access by index is `O(n)`. Insertion or deletion at a known node can be `O(1)`. Searching is `O(n)`. Reversal is `O(n)` time and `O(1)` extra space when iterative.",
      "## Common Mistakes",
      "Frequent bugs include dereferencing `null`, losing the rest of the list during reversal, forgetting to update the tail, creating accidental cycles, and mishandling one-node or empty-list cases.",
    ],
    codeSnippets: [
      {
        title: "Singly Linked List with Core Operations",
        language: "javascript",
        code: `class ListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  push(value) {
    const node = new ListNode(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }

    this.length++;
    return this;
  }

  unshift(value) {
    const node = new ListNode(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }

    this.length++;
    return this;
  }

  reverse() {
    let prev = null;
    let current = this.head;

    this.tail = this.head;

    while (current) {
      const next = current.next;
      current.next = prev;
      prev = current;
      current = next;
    }

    this.head = prev;
    return this;
  }
}`,
      },
      {
        title: "Middle Node and Cycle Detection",
        language: "javascript",
        code: `function findMiddle(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }

  return slow;
}

function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) return true;
  }

  return false;
}`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Implement `mergeTwoSortedLists(list1, list2)` iteratively using a dummy node, then implement `removeNthFromEnd(head, n)` using two pointers in one pass.",
    order: 4,
  },
  {
    slug: "stacks-and-queues",
    title: "5. Stacks, Queues, Deques & Monotonic Structures",
    summary:
      "Master LIFO/FIFO structures, efficient queue design, monotonic stacks and queues, and their most common interview applications.",
    content: [
      "## Stack: Last In, First Out",
      "A stack adds and removes from the same end. In JavaScript, an array with `push()` and `pop()` is usually enough. Common uses include nested-expression validation, undo history, DFS, parsing, and tracking unresolved elements.",
      "## Queue: First In, First Out",
      "A queue adds at the back and removes from the front. Queues are used in BFS, scheduling, buffering, and level-order tree traversal.",
      "## Avoid Repeated Array.shift() in Performance-Critical Algorithms",
      "`shift()` may require reindexing remaining array elements. For interview-friendly efficient queues, store a head index or build a small queue class rather than repeatedly shifting.",
      "## Deque",
      "A deque supports insertion and removal at both ends. It is useful for sliding-window maximum and other problems requiring candidates to expire from the front while new candidates enter from the back.",
      "## Monotonic Stack",
      "A monotonic stack keeps values or indices in increasing or decreasing order. It is powerful for Next Greater Element, Daily Temperatures, histogram-area problems, and removing dominated candidates.",
      "## Why Monotonic Structures Are Often O(n)",
      "Although a while loop may appear inside a for loop, each index is generally pushed once and popped at most once. Total stack operations are linear, so the whole algorithm remains `O(n)`.",
      "## Expression and Parentheses Problems",
      "Stacks naturally match nested structure. Push opening symbols or operands; pop them when the corresponding closing symbol or operator resolves the most recent unfinished work.",
      "## Queue Using Two Stacks",
      "A queue can be implemented with an input stack and an output stack. Moving elements only when the output stack is empty gives amortized `O(1)` enqueue and dequeue.",
      "## Complexity",
      "Stack push/pop are normally `O(1)`. A head-index queue supports amortized `O(1)` enqueue/dequeue. Monotonic stack solutions are commonly `O(n)` with `O(n)` auxiliary space.",
      "## Common Mistakes",
      "Watch for empty-structure access, storing values when indices are needed, discarding candidates too early, and failing to remove out-of-window deque entries.",
    ],
    codeSnippets: [
      {
        title: "Efficient Queue Without shift()",
        language: "javascript",
        code: `class Queue {
  constructor() {
    this.items = [];
    this.head = 0;
  }

  enqueue(value) {
    this.items.push(value);
  }

  dequeue() {
    if (this.head >= this.items.length) return undefined;

    const value = this.items[this.head];
    this.head++;
    return value;
  }

  get size() {
    return this.items.length - this.head;
  }
}`,
      },
      {
        title: "Daily Temperatures with a Monotonic Stack",
        language: "javascript",
        code: `function dailyTemperatures(temperatures) {
  const result = new Array(temperatures.length).fill(0);
  const stack = []; // indices with decreasing temperatures

  for (let i = 0; i < temperatures.length; i++) {
    while (
      stack.length &&
      temperatures[i] > temperatures[stack[stack.length - 1]]
    ) {
      const previousIndex = stack.pop();
      result[previousIndex] = i - previousIndex;
    }

    stack.push(i);
  }

  return result;
}

// Time: O(n)
// Space: O(n)`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Implement Sliding Window Maximum in O(n) using a deque of indices. Explain why storing only values makes expiration from the left side harder.",
    order: 5,
  },
  {
    slug: "recursion-and-backtracking",
    title: "6. Recursion & Backtracking",
    summary:
      "Understand recursive call structure, base cases, recursion trees, backtracking state, combinations, permutations, subsets, and search-space pruning.",
    content: [
      "## What Is Recursion?",
      "Recursion occurs when a function solves a problem by calling itself on a smaller version of that problem. Every correct recursive solution needs a base case that stops recursion and a recursive step that moves toward the base case.",
      "## The Call Stack",
      "Each recursive call creates a stack frame containing its local state and return location. Deep recursion consumes stack memory, so recursive depth is part of space-complexity analysis.",
      "## How to Design a Recursive Solution",
      "Define what the function means, identify the smallest solvable input, determine how one call reduces the problem, and trust the recursive call to solve the smaller version. This prevents trying to mentally simulate every level at once.",
      "## Recursion Trees",
      "A recursion tree visualizes branching. A single recursive call per level often creates linear depth; two independent recursive branches can create exponential work if overlapping work is not eliminated.",
      "## What Is Backtracking?",
      "Backtracking explores choices, recursively continues with a choice, then undoes that choice before trying another. It is a structured search through a decision tree.",
      "## Choose, Explore, Unchoose",
      "Most backtracking implementations follow the same template: make a choice, add it to current state, recurse, remove the choice, and continue with the next option.",
      "## Common Backtracking Problems",
      "Subsets, permutations, combinations, combination sum, N-Queens, word search, Sudoku, and path-finding with constraints are classic backtracking applications.",
      "## Pruning",
      "Pruning stops exploring a branch as soon as it cannot produce a valid or better answer. Good pruning can dramatically reduce practical runtime even when worst-case complexity remains exponential.",
      "## Mutable State vs Copying",
      "You can create a new array for each recursive branch or mutate one path and undo changes after recursion. Mutate-and-undo usually reduces allocations but requires disciplined backtracking.",
      "## Common Mistakes",
      "Typical bugs include missing base cases, not reducing the problem, forgetting to undo state, pushing the same mutable path reference into results, and allowing duplicate choices when the problem requires unique combinations.",
    ],
    codeSnippets: [
      {
        title: "Generate All Subsets",
        language: "javascript",
        code: `function subsets(nums) {
  const result = [];
  const path = [];

  function backtrack(index) {
    if (index === nums.length) {
      result.push([...path]);
      return;
    }

    // Exclude nums[index]
    backtrack(index + 1);

    // Include nums[index]
    path.push(nums[index]);
    backtrack(index + 1);
    path.pop();
  }

  backtrack(0);
  return result;
}

// Time: O(n * 2^n) including result copying
// Recursive depth: O(n)`,
      },
      {
        title: "Generate Permutations",
        language: "javascript",
        code: `function permutations(nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);

  function backtrack() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;

      used[i] = true;
      path.push(nums[i]);

      backtrack();

      path.pop();
      used[i] = false;
    }
  }

  backtrack();
  return result;
}`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Solve `combinationSum(candidates, target)` with backtracking. Add pruning so recursion stops when the remaining target becomes negative.",
    order: 6,
  },
  {
    slug: "trees-and-binary-search-trees",
    title: "7. Trees & Binary Search Trees",
    summary:
      "Master tree terminology, recursive structure, BST operations, DFS traversals, BFS level order, height/depth problems, and tree construction.",
    content: [
      "## Tree Fundamentals",
      "A tree is a hierarchical structure of nodes connected by edges. Important terms include root, parent, child, sibling, leaf, subtree, depth, height, and level. A tree with `n` nodes has `n - 1` edges when it is connected and acyclic.",
      "## Binary Trees",
      "A binary tree allows each node to have at most two children, commonly named `left` and `right`. A binary tree is not automatically a binary search tree.",
      "## Binary Search Tree Property",
      "In a BST, values in the left subtree are ordered before the current node and values in the right subtree after it according to the chosen comparison rule. Search, insertion, and deletion depend on this ordering.",
      "## Balanced vs Skewed BST",
      "A reasonably balanced BST can provide `O(log n)` search and insertion. A skewed BST may behave like a linked list and degrade to `O(n)`.",
      "## Depth-First Traversals",
      "**Preorder:** node, left, right. **Inorder:** left, node, right. **Postorder:** left, right, node. Inorder traversal of a valid BST produces values in sorted order.",
      "## Breadth-First Traversal",
      "BFS visits nodes level by level using a queue. It is useful for level-order output, minimum depth in an unweighted tree, nearest-node problems, and level-based aggregation.",
      "## Recursive Tree Thinking",
      "Many tree problems become simpler when each recursive call is defined as solving the same problem for one subtree. Height, balance, subtree sums, validation, and lowest common ancestor all benefit from this viewpoint.",
      "## Height and Depth",
      "Depth measures distance from root to a node. Height measures the longest downward path from a node to a leaf. Be explicit whether you count edges or nodes because conventions differ.",
      "## Tree Construction",
      "Some interview problems reconstruct trees from traversal sequences or convert sorted arrays to balanced BSTs. These problems test understanding of traversal ordering and recursive partition boundaries.",
      "## Common Mistakes",
      "Do not assume a binary tree is a BST, forget null base cases, accidentally use repeated array `shift()` in BFS, or validate a BST by comparing only each node with its immediate children.",
    ],
    codeSnippets: [
      {
        title: "BST Insert and Search",
        language: "javascript",
        code: `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const node = new TreeNode(value);

    if (!this.root) {
      this.root = node;
      return this;
    }

    let current = this.root;

    while (true) {
      if (value === current.value) return this;

      if (value < current.value) {
        if (!current.left) {
          current.left = node;
          return this;
        }

        current = current.left;
      } else {
        if (!current.right) {
          current.right = node;
          return this;
        }

        current = current.right;
      }
    }
  }

  contains(value) {
    let current = this.root;

    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }

    return false;
  }
}`,
      },
      {
        title: "DFS and BFS Traversals",
        language: "javascript",
        code: `function inorder(root) {
  const result = [];

  function dfs(node) {
    if (!node) return;

    dfs(node.left);
    result.push(node.value);
    dfs(node.right);
  }

  dfs(root);
  return result;
}

function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];
  let head = 0;

  while (head < queue.length) {
    const node = queue[head++];
    result.push(node.value);

    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }

  return result;
}`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Implement `isValidBST(root)` using lower and upper bounds, then implement `isBalanced(root)` so that each subtree height is computed only once.",
    order: 7,
  },
  {
    slug: "heaps-and-priority-queues",
    title: "8. Heaps & Priority Queues",
    summary:
      "Learn binary heaps, heap invariants, insertion/removal, top-k problems, streaming selection, and priority-driven algorithms.",
    content: [
      "## What Is a Heap?",
      "A binary heap is a complete binary tree usually stored compactly in an array. A min-heap keeps every parent less than or equal to its children; a max-heap keeps every parent greater than or equal to its children.",
      "## Array Representation",
      "For a zero-based array index `i`, the left child is `2 * i + 1`, the right child is `2 * i + 2`, and the parent is `Math.floor((i - 1) / 2)`.",
      "## Heap vs BST",
      "A heap guarantees only parent-child priority, not full sorted ordering. It gives fast access to the minimum or maximum element but is not ideal for searching arbitrary values.",
      "## Priority Queue",
      "A priority queue removes the highest- or lowest-priority item rather than strictly following insertion order. A binary heap is a common implementation.",
      "## Heap Insert",
      "Append the new value at the end, then repeatedly swap it with its parent while the heap property is violated. This upward repair is called bubble-up or sift-up and takes `O(log n)`.",
      "## Heap Removal",
      "To remove the root, replace it with the last element, remove the last slot, and repeatedly swap downward with the preferred child. This is called sink-down or sift-down and takes `O(log n)`.",
      "## Top K Problems",
      "For `k` largest values, a min-heap of size `k` lets you discard values that cannot belong to the final answer. This often gives `O(n log k)` instead of sorting all `n` values in `O(n log n)`.",
      "## Common Applications",
      "Heaps appear in kth-largest problems, task scheduling, merge-k-sorted-lists, streaming median variations, graph shortest paths, and event simulation.",
      "## Complexity",
      "Peek is `O(1)`. Insert and root removal are `O(log n)`. Building a heap bottom-up can be `O(n)`.",
      "## Common Mistakes",
      "Frequent issues include incorrect child-index calculations, choosing the wrong child during sink-down, forgetting heap-size boundaries, and using a min-heap where a max-heap strategy is required.",
    ],
    codeSnippets: [
      {
        title: "Min Heap Implementation",
        language: "javascript",
        code: `class MinHeap {
  constructor() {
    this.values = [];
  }

  peek() {
    return this.values[0];
  }

  push(value) {
    this.values.push(value);
    this.#bubbleUp();
  }

  pop() {
    if (this.values.length === 0) return undefined;
    if (this.values.length === 1) return this.values.pop();

    const min = this.values[0];
    this.values[0] = this.values.pop();
    this.#sinkDown();

    return min;
  }

  #bubbleUp() {
    let index = this.values.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.values[parent] <= this.values[index]) break;

      [this.values[parent], this.values[index]] =
        [this.values[index], this.values[parent]];

      index = parent;
    }
  }

  #sinkDown() {
    let index = 0;

    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (
        left < this.values.length &&
        this.values[left] < this.values[smallest]
      ) {
        smallest = left;
      }

      if (
        right < this.values.length &&
        this.values[right] < this.values[smallest]
      ) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.values[index], this.values[smallest]] =
        [this.values[smallest], this.values[index]];

      index = smallest;
    }
  }
}`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Use a heap to implement `findKthLargest(nums, k)` in O(n log k), then explain why keeping only k candidates is more memory-efficient than sorting a copy of the entire array.",
    order: 8,
  },
  {
    slug: "graphs-and-graph-traversal",
    title: "9. Graphs: Representation, BFS, DFS & Connectivity",
    summary:
      "Understand directed and undirected graphs, adjacency lists, traversal, connected components, cycle detection, and grid-as-graph reasoning.",
    content: [
      "## What Is a Graph?",
      "A graph contains vertices connected by edges. Graphs model social networks, roads, dependencies, computer networks, grids, recommendations, and many other non-hierarchical relationships.",
      "## Directed vs Undirected",
      "An undirected edge connects both ways. A directed edge has an explicit direction. This distinction changes traversal, cycle detection, degree calculations, and connectivity reasoning.",
      "## Weighted vs Unweighted",
      "Weighted edges carry costs such as distance, time, or price. Unweighted graph shortest path can be solved with BFS, while weighted shortest-path problems may require algorithms such as Dijkstra.",
      "## Adjacency List",
      "An adjacency list stores each vertex together with its neighbors. It is typically space-efficient for sparse graphs and makes traversing outgoing edges straightforward.",
      "## BFS",
      "Breadth-first search explores vertices in increasing edge distance from the start. In an unweighted graph, the first time BFS reaches a node gives a shortest path in number of edges.",
      "## DFS",
      "Depth-first search follows one path deeply before backtracking. It is useful for connected components, cycle detection, topological reasoning, flood fill, and exploring all reachable states.",
      "## Visited Tracking",
      "Without a visited Set or equivalent state, traversal on a cyclic graph can repeat forever. Marking at the correct time also prevents duplicate work.",
      "## Connected Components",
      "To count connected components, iterate over every vertex and start a traversal whenever an unvisited vertex is found. Each new traversal discovers one component.",
      "## Grids as Graphs",
      "Matrix problems such as Number of Islands can be treated as graph problems where each cell is a node and edges connect allowed neighboring cells.",
      "## Complexity",
      "With an adjacency list, BFS and DFS are `O(V + E)` because each vertex is processed and each edge is examined a bounded number of times.",
      "## Common Mistakes",
      "Common errors include forgetting disconnected vertices, mixing directed and undirected edge insertion, marking visited too late, mutating a grid unexpectedly, and assuming BFS always works for weighted shortest paths.",
    ],
    codeSnippets: [
      {
        title: "Adjacency List Graph",
        language: "javascript",
        code: `class Graph {
  constructor() {
    this.adjacency = new Map();
  }

  addVertex(vertex) {
    if (!this.adjacency.has(vertex)) {
      this.adjacency.set(vertex, []);
    }
  }

  addUndirectedEdge(a, b) {
    this.addVertex(a);
    this.addVertex(b);

    this.adjacency.get(a).push(b);
    this.adjacency.get(b).push(a);
  }

  bfs(start) {
    const visited = new Set([start]);
    const queue = [start];
    const result = [];
    let head = 0;

    while (head < queue.length) {
      const node = queue[head++];
      result.push(node);

      for (const neighbor of this.adjacency.get(node) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return result;
  }
}`,
      },
      {
        title: "Number of Islands with DFS",
        language: "javascript",
        code: `function numIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let islands = 0;

  function dfs(r, c) {
    if (
      r < 0 ||
      c < 0 ||
      r >= rows ||
      c >= cols ||
      grid[r][c] !== "1"
    ) {
      return;
    }

    grid[r][c] = "0";

    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        islands++;
        dfs(r, c);
      }
    }
  }

  return islands;
}`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Implement `cloneGraph(node)` with DFS or BFS and a Map from original nodes to cloned nodes. Then implement connected-component counting for an undirected graph.",
    order: 9,
  },
  {
    slug: "sorting-and-searching-algorithms",
    title: "10. Searching, Sorting & Divide and Conquer",
    summary:
      "Master binary search variants, elementary sorts, merge sort, quick sort, partitioning, and divide-and-conquer reasoning.",
    content: [
      "## Linear Search",
      "Linear search checks values sequentially and works on unsorted input. Its worst-case time is `O(n)`, but it may be perfectly appropriate for small data or one-time scans.",
      "## Binary Search",
      "Binary search repeatedly eliminates half of a sorted search space. Standard array search is `O(log n)`, but the deeper skill is learning to binary-search an answer space or boundary condition.",
      "## Binary Search Invariants",
      "Choose a consistent interval style such as inclusive `[left, right]` and maintain its meaning throughout. Most binary-search bugs are boundary bugs rather than conceptual bugs.",
      "## Elementary Sorting",
      "Bubble, selection, and insertion sort are generally `O(n²)`. They remain useful pedagogically because they teach swapping, local ordering, stability, and loop invariants. Insertion sort can also be efficient on small or nearly sorted data.",
      "## Merge Sort",
      "Merge sort divides input into halves, recursively sorts each half, and merges them. It guarantees `O(n log n)` time but commonly uses `O(n)` auxiliary space.",
      "## Quick Sort",
      "Quick sort partitions values around a pivot, then recursively sorts partitions. Average time is `O(n log n)` but poor pivot choices can degrade to `O(n²)`.",
      "## Divide and Conquer",
      "Divide and conquer breaks a problem into independent smaller problems, solves them recursively, and combines results. Merge sort and binary search are core examples.",
      "## Stable Sorting",
      "A stable sort preserves the relative order of equal-key items. Stability matters when sorting records by multiple fields in stages.",
      "## JavaScript Array.sort()",
      "For numeric sorting, provide a comparator such as `(a, b) => a - b`; otherwise values are compared as strings. Built-in sorting is appropriate in many interviews unless implementing sorting is itself the task.",
      "## Common Mistakes",
      "Typical errors include binary searching unsorted input, integer-boundary mistakes, forgetting a numeric comparator, losing elements during merge, and writing partition logic that does not guarantee progress.",
    ],
    codeSnippets: [
      {
        title: "Binary Search and First Occurrence",
        language: "javascript",
        code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] === target) return mid;

    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

function firstOccurrence(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let answer = -1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] >= target) {
      if (arr[mid] === target) answer = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return answer;
}`,
      },
      {
        title: "Merge Sort",
        language: "javascript",
        code: `function merge(left, right) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return result.concat(left.slice(i), right.slice(j));
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

// Time: O(n log n)
// Extra space: O(n)`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Implement search in a rotated sorted array in O(log n). Then implement Quick Sort and explain how pivot choice affects worst-case behavior.",
    order: 10,
  },
  {
    slug: "greedy-algorithms",
    title: "11. Greedy Algorithms & Interval Problems",
    summary:
      "Learn how to make locally optimal choices, recognize when greedy reasoning is valid, and solve interval, scheduling, and reachability problems.",
    content: [
      "## What Is a Greedy Algorithm?",
      "A greedy algorithm makes the best-looking choice available at the current step and does not normally revisit previous choices. The challenge is proving that these local choices lead to a globally optimal result.",
      "## Greedy Is Not Just 'Pick the Largest'",
      "Different problems require different greedy criteria: earliest finishing interval, smallest cost, farthest reachable position, highest gain per constraint, or another property justified by the problem structure.",
      "## Greedy Choice Property",
      "A problem is suitable for greedy reasoning when an optimal solution can be built by making a locally optimal choice and then solving the remaining subproblem without needing to reconsider that choice.",
      "## Interval Problems",
      "Sorting intervals by start or end time often reveals a greedy strategy. Common problems include merging intervals, selecting maximum non-overlapping intervals, meeting rooms, and minimum removals for overlap.",
      "## Reachability Problems",
      "Problems such as Jump Game can track the farthest reachable index. Instead of exploring every sequence of jumps, greedily retain the best reach achieved so far.",
      "## Greedy vs Dynamic Programming",
      "Greedy keeps one locally best state, while DP keeps enough subproblem information to compare multiple possibilities. If a local decision can block a better future outcome, greedy may fail and DP may be needed.",
      "## Exchange Argument Intuition",
      "One common proof technique shows that if an optimal solution makes a different first choice, we can exchange it with the greedy choice without making the solution worse.",
      "## Sorting Cost",
      "Many greedy algorithms are linear after sorting, so total complexity becomes `O(n log n)`. Always include the sorting step in complexity analysis.",
      "## Common Mistakes",
      "The biggest mistake is applying greedy logic because it feels natural without proving or testing it. Build counterexamples, especially when choices interact over long distances.",
    ],
    codeSnippets: [
      {
        title: "Jump Game",
        language: "javascript",
        code: `function canJump(nums) {
  let farthest = 0;

  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;

    farthest = Math.max(farthest, i + nums[i]);

    if (farthest >= nums.length - 1) {
      return true;
    }
  }

  return true;
}

// Time: O(n)
// Space: O(1)`,
      },
      {
        title: "Minimum Intervals to Remove",
        language: "javascript",
        code: `function eraseOverlapIntervals(intervals) {
  if (intervals.length <= 1) return 0;

  intervals.sort((a, b) => a[1] - b[1]);

  let removals = 0;
  let previousEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    const [start, end] = intervals[i];

    if (start < previousEnd) {
      removals++;
    } else {
      previousEnd = end;
    }
  }

  return removals;
}`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Solve the Gas Station problem using greedy reasoning, then write a short explanation of why restarting after a failed segment does not skip a valid start inside that failed segment.",
    order: 11,
  },
  {
    slug: "dynamic-programming",
    title: "12. Dynamic Programming: Memoization, Tabulation & State Design",
    summary:
      "Learn how to recognize overlapping subproblems, define DP state and transitions, and solve 1D, 2D, subsequence, knapsack, and path problems.",
    content: [
      "## What Is Dynamic Programming?",
      "Dynamic programming solves problems that contain overlapping subproblems and optimal substructure by storing results instead of recomputing them. DP is less about memorizing tables and more about defining the right state.",
      "## Recognizing DP Problems",
      "DP is a strong candidate when a brute-force recursive solution repeatedly solves the same states, when a problem asks for a count/minimum/maximum/best value, or when decisions depend on a small set of changing parameters.",
      "## Step 1: Define the State",
      "A DP state must capture all information needed to solve the remaining problem. Examples include `dp[i]`, `dp[i][j]`, `(index, remainingAmount)`, or `(row, column)`.",
      "## Step 2: Write the Transition",
      "The transition explains how the answer for one state depends on smaller states. For climbing stairs, `dp[i] = dp[i - 1] + dp[i - 2]`. For minimum-cost problems, transitions often use `Math.min`.",
      "## Step 3: Base Cases",
      "Base states anchor the recurrence. Incorrect base cases create wrong answers even if the recurrence is correct.",
      "## Memoization",
      "Top-down memoization starts with recursive problem structure and caches state results in an array, object, or Map. It often mirrors the mathematical recurrence clearly.",
      "## Tabulation",
      "Bottom-up tabulation computes states in dependency order. It avoids recursion-stack overhead and can make space optimization easier.",
      "## Space Optimization",
      "If each state depends only on a few previous states, you may not need the full DP table. Fibonacci and House Robber can be reduced from `O(n)` memory to `O(1)`.",
      "## Common DP Families",
      "Important families include 1D sequence DP, grid/path DP, 0/1 knapsack, unbounded knapsack, subsequence DP, string DP, interval DP, and tree DP.",
      "## DP vs Backtracking",
      "Backtracking usually enumerates possibilities and can prune branches. DP reuses solutions for repeated states. Some problems begin as backtracking and become efficient once memoization is added.",
      "## Common Mistakes",
      "Typical errors include an incomplete state definition, wrong iteration order, accidental reuse of current-row values, mixing 0/1 and unbounded knapsack transitions, and optimizing space before the recurrence is fully understood.",
    ],
    codeSnippets: [
      {
        title: "House Robber with O(1) Extra Space",
        language: "javascript",
        code: `function rob(nums) {
  let twoBack = 0;
  let oneBack = 0;

  for (const money of nums) {
    const current = Math.max(
      oneBack,
      twoBack + money
    );

    twoBack = oneBack;
    oneBack = current;
  }

  return oneBack;
}

// Time: O(n)
// Space: O(1)`,
      },
      {
        title: "Coin Change: Bottom-Up DP",
        language: "javascript",
        code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let current = 1; current <= amount; current++) {
    for (const coin of coins) {
      if (coin <= current) {
        dp[current] = Math.min(
          dp[current],
          dp[current - coin] + 1
        );
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// Time: O(amount * coins.length)
// Space: O(amount)`,
      },
      {
        title: "Longest Common Subsequence",
        language: "javascript",
        code: `function longestCommonSubsequence(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;

  const dp = Array.from(
    { length: rows },
    () => new Array(cols).fill(0)
  );

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(
          dp[i - 1][j],
          dp[i][j - 1]
        );
      }
    }
  }

  return dp[a.length][b.length];
}`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Solve `wordBreak(s, wordDict)` first with brute-force recursion, then add memoization. Identify the exact repeated state that memoization eliminates.",
    order: 12,
  },
  {
    slug: "advanced-graph-algorithms",
    title: "13. Advanced Graph Algorithms: Topological Sort & Shortest Paths",
    summary:
      "Move beyond basic traversal into dependency ordering, DAG reasoning, weighted shortest paths, and union-find connectivity.",
    content: [
      "## Topological Sorting",
      "A topological ordering places every directed edge `u -> v` so that `u` appears before `v`. It is defined only for directed acyclic graphs (DAGs). Typical applications include course prerequisites, build systems, and dependency scheduling.",
      "## Kahn's Algorithm",
      "Kahn's algorithm tracks indegrees, begins with all zero-indegree vertices, repeatedly removes one, and decreases the indegree of its outgoing neighbors. If fewer than `V` vertices are processed, a directed cycle exists.",
      "## DFS Topological Sort",
      "A DFS-based approach records nodes after all descendants are processed and then reverses the finishing order. Cycle detection requires tracking recursion-path state separately from globally visited state.",
      "## Shortest Path in Unweighted Graphs",
      "Use BFS when every edge has equal cost. BFS explores by edge distance, so the first visit to a node yields a shortest unweighted path.",
      "## Dijkstra's Algorithm",
      "Dijkstra solves single-source shortest paths with non-negative edge weights. It repeatedly processes the currently known closest vertex, usually using a min-priority queue.",
      "## Relaxation",
      "Relaxing an edge checks whether reaching `neighbor` through `current` improves the known distance. If so, update the distance and priority.",
      "## Negative Weights",
      "Standard Dijkstra is not valid when negative edge weights can invalidate the greedy finalized-distance assumption. Different algorithms are needed for such graphs.",
      "## Union-Find / Disjoint Set",
      "Union-Find efficiently tracks which vertices belong to the same connected component. With path compression and union by rank/size, operations are extremely close to constant time in practice.",
      "## Common Union-Find Uses",
      "Cycle detection in undirected graphs, Kruskal-style minimum spanning tree logic, account merging, dynamic connectivity, and redundant-connection problems commonly use DSU.",
      "## Complexity",
      "Kahn topological sort is `O(V + E)`. Dijkstra with a binary heap is commonly `O((V + E) log V)`. DSU operations are near-constant amortized time with standard optimizations.",
      "## Common Mistakes",
      "Watch for applying topological sort to undirected graphs, using Dijkstra with negative weights, marking a node permanently too early with stale heap entries, and implementing Union-Find without path compression.",
    ],
    codeSnippets: [
      {
        title: "Course Schedule with Kahn's Algorithm",
        language: "javascript",
        code: `function canFinish(numCourses, prerequisites) {
  const graph = Array.from(
    { length: numCourses },
    () => []
  );

  const indegree = new Array(numCourses).fill(0);

  for (const [course, prerequisite] of prerequisites) {
    graph[prerequisite].push(course);
    indegree[course]++;
  }

  const queue = [];
  let head = 0;

  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i);
  }

  let completed = 0;

  while (head < queue.length) {
    const course = queue[head++];
    completed++;

    for (const next of graph[course]) {
      indegree[next]--;

      if (indegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  return completed === numCourses;
}`,
      },
      {
        title: "Disjoint Set Union",
        language: "javascript",
        code: `class DSU {
  constructor(n) {
    this.parent = Array.from(
      { length: n },
      (_, index) => index
    );

    this.size = new Array(n).fill(1);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }

    return this.parent[x];
  }

  union(a, b) {
    let rootA = this.find(a);
    let rootB = this.find(b);

    if (rootA === rootB) return false;

    if (this.size[rootA] < this.size[rootB]) {
      [rootA, rootB] = [rootB, rootA];
    }

    this.parent[rootB] = rootA;
    this.size[rootA] += this.size[rootB];

    return true;
  }
}`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Implement Network Delay Time using Dijkstra's algorithm with your own min-heap. Then solve Redundant Connection using Union-Find.",
    order: 13,
  },
  {
    slug: "coding-interview-problem-solving",
    title: "14. Coding Interview Problem Solving & Pattern Recognition",
    summary:
      "Combine the course into a practical interview workflow: clarify, model, choose patterns, prove correctness, analyze complexity, test edge cases, and optimize.",
    content: [
      "## The Goal Is Pattern Recognition, Not Memorization",
      "Memorizing hundreds of finished solutions is fragile. A stronger approach is learning signals that point toward reusable patterns and then deriving the implementation from constraints.",
      "## Step 1: Clarify the Problem",
      "Confirm input format, output format, constraints, whether values can repeat, whether input is sorted, whether mutation is allowed, and what should happen for empty or invalid input.",
      "## Step 2: Build a Brute-Force Baseline",
      "A simple correct solution creates a reference point. It proves you understand the task and reveals exactly where repeated work occurs.",
      "## Step 3: Use Constraints to Guide Optimization",
      "Large `n` often rules out quadratic solutions. Sorted input suggests binary search or two pointers. Contiguous ranges suggest sliding window or prefix sums. Repeated lookup suggests hashing.",
      "## Pattern Signals",
      "**Two pointers:** sorted arrays, opposite ends, in-place compaction.\n**Sliding window:** contiguous subarray/substring.\n**Hashing:** membership, counting, complements, grouping.\n**Stack:** nested structure, previous/next greater value.\n**Heap:** top-k, repeated best-choice extraction.\n**BFS:** shortest unweighted path, level order.\n**DFS/backtracking:** exhaustive state exploration.\n**DP:** overlapping optimization/counting states.",
      "## Step 4: State the Invariant",
      "An invariant is a condition that remains true as the algorithm runs. Examples: everything left of a pointer is already processed; the current window contains no duplicates; the heap contains the best `k` candidates seen so far.",
      "## Step 5: Prove Correctness Informally",
      "Explain why every candidate answer is considered or why discarded candidates can never become optimal. Good interview explanations focus on the key reason the algorithm cannot miss a valid answer.",
      "## Step 6: Analyze Complexity",
      "State time and auxiliary space. Mention sorting, recursion depth, result storage, and any assumptions about Map/Set operations.",
      "## Step 7: Test Edge Cases",
      "Test empty input, one element, duplicates, already sorted/reversed input, negative values, maximum constraints, disconnected graphs, skewed trees, and cases where no valid answer exists.",
      "## Step 8: Write Clean JavaScript",
      "Use meaningful variable names, avoid unnecessary cleverness, separate helpers when they improve clarity, and use the data structure that matches the algorithm rather than forcing everything through arrays or objects.",
      "## A Practical Study Loop",
      "For each problem: solve it, explain the pattern, record the mistake or insight, re-solve it after a delay without looking at the previous code, and then solve a different problem using the same pattern. This builds transferable skill.",
      "## Final Course Checklist",
      "You should be able to explain Big O, recognize core patterns, implement foundational structures, traverse trees and graphs, use heaps and hashing, reason recursively, formulate DP states, and communicate why a solution is correct and efficient.",
    ],
    codeSnippets: [
      {
        title: "Reusable Interview Solution Template",
        language: "javascript",
        code: `function solve(input) {
  // 1. Clarify constraints and expected output.

  // 2. Identify the pattern:
  //    hashing, two pointers, sliding window,
  //    stack, heap, BFS/DFS, DP, etc.

  // 3. State the invariant before coding.

  // 4. Implement the simplest correct optimized solution.

  // 5. Verify important edge cases.

  // 6. State:
  //    Time complexity: O(...)
  //    Space complexity: O(...)

  return input;
}`,
      },
      {
        title: "Pattern Example: Product Except Self",
        language: "javascript",
        code: `function productExceptSelf(nums) {
  const result = new Array(nums.length).fill(1);

  let prefix = 1;

  for (let i = 0; i < nums.length; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;

  for (let i = nums.length - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }

  return result;
}

// Time: O(n)
// Extra space: O(1) if output array is excluded`,
      },
    ],
    language: "javascript",
    tryItChallenge:
      "Take five problems you previously solved by memorization. For each one, rewrite the solution from scratch and label the pattern, invariant, time complexity, space complexity, and the clue that should help you recognize the pattern next time.",
    order: 14,
  },
];

async function seedDSAInJavaScript() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    let course = await Course.findOne({ slug: courseData.slug });

    if (course) {
      console.log(
        `Course "${courseData.title}" already exists (ID: ${course._id}). Updating details...`,
      );
      Object.assign(course, courseData);
      await course.save();
    } else {
      console.log(`Creating new course: "${courseData.title}"...`);
      course = await Course.create(courseData);
      console.log(`Course created with ID: ${course._id}`);
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const chapterData of chaptersData) {
      const existingChapter = await Chapter.findOne({
        course: course._id,
        slug: chapterData.slug,
      });

      if (existingChapter) {
        Object.assign(existingChapter, chapterData);
        await existingChapter.save();
        updatedCount++;
      } else {
        await Chapter.create({
          ...chapterData,
          course: course._id,
        });
        createdCount++;
      }
    }

    console.log("Seeding complete!");
    console.log(`- Course ID: ${course._id}`);
    console.log(`- Course Slug: /courses/${course.slug}`);
    console.log(`- Chapters created: ${createdCount}`);
    console.log(`- Chapters updated: ${updatedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding DSA in JavaScript course:", error);
    process.exit(1);
  }
}

seedDSAInJavaScript();
