/**
 * Coding Problem & Submission Models
 * Server-side coding problem definitions with hidden test cases.
 * Also includes the CodingSubmission model for persisting submission results.
 */
import mongoose, { Schema, Document } from 'mongoose';

/* ===========================
   Coding Problem — Server-side store with hidden test cases
   =========================== */
export interface ICodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  tags: string[];
  description: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: Record<string, string>; // languageName -> code template
  visibleTestCases: { stdin: string; expectedOutput: string }[];
  hiddenTestCases: { stdin: string; expectedOutput: string }[];
  timeComplexity?: string;
  spaceComplexity?: string;
  approach?: {
    title: string;
    explanation: string;
    steps: string[];
  };
}

/**
 * In-memory coding problem store.
 * These problems live server-side so hidden test cases are never exposed.
 * Each problem has visibleTestCases (shown in UI) and hiddenTestCases (evaluated on submit).
 */
export const CODING_PROBLEMS_SERVER: ICodingProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Medium',
    topic: 'Arrays',
    tags: ['Arrays', 'Hash Table'],
    description:
      'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      '-10⁹ ≤ target ≤ 10⁹',
      'Only one valid answer exists.',
    ],
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9.' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
    ],
    starterCode: {
      'Python': 'import sys\n\ndef two_sum(nums, target):\n    # Write your solution here\n    pass\n\n# Read input\nnums = list(map(int, input().split()))\ntarget = int(input())\nresult = two_sum(nums, target)\nprint(result)',
      'JavaScript': 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on("line", l => lines.push(l));\nrl.on("close", () => {\n  const nums = lines[0].split(" ").map(Number);\n  const target = parseInt(lines[1]);\n  // Write your solution here\n  console.log(twoSum(nums, target));\n});\n\nfunction twoSum(nums, target) {\n  // your code\n}',
      'C++': '#include <iostream>\n#include <vector>\n#include <sstream>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    istringstream iss(line);\n    vector<int> nums;\n    int x;\n    while (iss >> x) nums.push_back(x);\n    int target;\n    cin >> target;\n    // Write your solution here\n    // Print result\n    return 0;\n}',
      'Java': 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(" ");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        int target = sc.nextInt();\n        // Write your solution here\n    }\n}',
    },
    visibleTestCases: [
      { stdin: '2 7 11 15\n9', expectedOutput: '[0, 1]' },
      { stdin: '3 2 4\n6', expectedOutput: '[1, 2]' },
    ],
    hiddenTestCases: [
      { stdin: '3 3\n6', expectedOutput: '[0, 1]' },
      { stdin: '1 5 3 7\n8', expectedOutput: '[1, 2]' },
      { stdin: '-1 -2 -3 -4 -5\n-8', expectedOutput: '[2, 4]' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    approach: {
      title: 'One-Pass Hash Map',
      explanation: 'Iterate and check if the complement exists in a hash map.',
      steps: [
        'Create an empty hash map.',
        'For each element, compute complement = target - nums[i].',
        'If complement exists in map, return the indices.',
        'Otherwise, add nums[i] to the map.',
      ],
    },
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    topic: 'Strings',
    tags: ['Strings', 'Two Pointers'],
    description:
      'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    constraints: ['1 ≤ s.length ≤ 10⁵', 's[i] is a printable ASCII character.'],
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
    ],
    starterCode: {
      'Python': 's = input().strip()\nprint(s[::-1])',
      'JavaScript': 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on("line", (line) => {\n  console.log(line.split("").reverse().join(""));\n  rl.close();\n});',
      'C++': '#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s;\n    getline(cin, s);\n    reverse(s.begin(), s.end());\n    cout << s;\n    return 0;\n}',
      'Java': 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(new StringBuilder(s).reverse().toString());\n    }\n}',
    },
    visibleTestCases: [
      { stdin: 'hello', expectedOutput: 'olleh' },
      { stdin: 'Hannah', expectedOutput: 'hannaH' },
    ],
    hiddenTestCases: [
      { stdin: 'a', expectedOutput: 'a' },
      { stdin: 'ab', expectedOutput: 'ba' },
      { stdin: 'racecar', expectedOutput: 'racecar' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    approach: {
      title: 'Two Pointer Swap',
      explanation: 'Use two pointers from both ends swapping characters.',
      steps: ['Initialize left=0, right=n-1.', 'Swap s[left] and s[right].', 'Move pointers inward.', 'Repeat until they meet.'],
    },
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'Easy',
    topic: 'Arrays',
    tags: ['Math', 'Simulation'],
    description:
      'Given an integer n, return a string array answer (1-indexed) where:\n\n- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.\n- answer[i] == "Fizz" if i is divisible by 3.\n- answer[i] == "Buzz" if i is divisible by 5.\n- answer[i] == i (as a string) otherwise.\n\nPrint each element on a new line.',
    constraints: ['1 ≤ n ≤ 10⁴'],
    examples: [
      { input: 'n = 5', output: '1\n2\nFizz\n4\nBuzz' },
      { input: 'n = 15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' },
    ],
    starterCode: {
      'Python': 'n = int(input())\nfor i in range(1, n + 1):\n    # Write your solution here\n    pass',
      'JavaScript': 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on("line", (line) => {\n  const n = parseInt(line);\n  for (let i = 1; i <= n; i++) {\n    // Write your solution here\n  }\n  rl.close();\n});',
      'C++': '#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    for (int i = 1; i <= n; i++) {\n        // Write your solution here\n    }\n    return 0;\n}',
      'Java': 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        for (int i = 1; i <= n; i++) {\n            // Write your solution here\n        }\n    }\n}',
    },
    visibleTestCases: [
      { stdin: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz' },
      { stdin: '3', expectedOutput: '1\n2\nFizz' },
    ],
    hiddenTestCases: [
      { stdin: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' },
      { stdin: '1', expectedOutput: '1' },
      { stdin: '30', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    approach: {
      title: 'Simple Modulo Checks',
      explanation: 'Check divisibility by 15 first, then 3, then 5.',
      steps: [
        'Loop from 1 to n.',
        'If i % 15 == 0, print "FizzBuzz".',
        'Else if i % 3 == 0, print "Fizz".',
        'Else if i % 5 == 0, print "Buzz".',
        'Else print i.',
      ],
    },
  },
  {
    id: 'palindrome-check',
    title: 'Palindrome Check',
    difficulty: 'Easy',
    topic: 'Strings',
    tags: ['Strings', 'Two Pointers'],
    description: 'Given a string s, determine if it is a palindrome. Print "true" if it is, "false" otherwise.\n\nConsider only alphanumeric characters and ignore cases.',
    constraints: ['1 ≤ s.length ≤ 2 * 10⁵', 's consists only of printable ASCII characters.'],
    examples: [
      { input: 'racecar', output: 'true' },
      { input: 'hello', output: 'false' },
    ],
    starterCode: {
      'Python': 's = input().strip()\n# Write your solution here\n',
      'JavaScript': 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on("line", (line) => {\n  // Write your solution here\n  rl.close();\n});',
      'C++': '#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s;\n    getline(cin, s);\n    // Write your solution here\n    return 0;\n}',
      'Java': 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        // Write your solution here\n    }\n}',
    },
    visibleTestCases: [
      { stdin: 'racecar', expectedOutput: 'true' },
      { stdin: 'hello', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { stdin: 'a', expectedOutput: 'true' },
      { stdin: 'ab', expectedOutput: 'false' },
      { stdin: 'abba', expectedOutput: 'true' },
      { stdin: 'abcba', expectedOutput: 'true' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    approach: {
      title: 'Two Pointer Comparison',
      explanation: 'Compare characters from both ends, moving inward.',
      steps: ['Initialize left=0, right=len-1.', 'Compare s[left] and s[right].', 'If mismatch, return false.', 'Move pointers inward until they meet.'],
    },
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray (Kadane\'s)',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    tags: ['Arrays', 'Dynamic Programming'],
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.',
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
    ],
    starterCode: {
      'Python': 'nums = list(map(int, input().split()))\n# Write your solution here\n',
      'JavaScript': 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on("line", (line) => {\n  const nums = line.split(" ").map(Number);\n  // Write your solution here\n  rl.close();\n});',
      'C++': '#include <iostream>\n#include <sstream>\n#include <vector>\n#include <climits>\nusing namespace std;\nint main() {\n    string line;\n    getline(cin, line);\n    istringstream iss(line);\n    vector<int> nums;\n    int x;\n    while (iss >> x) nums.push_back(x);\n    // Write your solution here\n    return 0;\n}',
      'Java': 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(" ");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        // Write your solution here\n    }\n}',
    },
    visibleTestCases: [
      { stdin: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' },
      { stdin: '1', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { stdin: '5 4 -1 7 8', expectedOutput: '23' },
      { stdin: '-1', expectedOutput: '-1' },
      { stdin: '-2 -1', expectedOutput: '-1' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    approach: {
      title: "Kadane's Algorithm",
      explanation: 'Track maximum sum ending at each position.',
      steps: [
        'Initialize currentSum = nums[0], maxSum = nums[0].',
        'For each element from index 1 onward.',
        'currentSum = max(nums[i], currentSum + nums[i]).',
        'maxSum = max(maxSum, currentSum).',
        'Return maxSum.',
      ],
    },
  },
];

/** Find a problem by its id */
export function findProblemById(id: string): ICodingProblem | undefined {
  return CODING_PROBLEMS_SERVER.find(p => p.id === id);
}

/** Get all problems (without hidden test cases — safe to send to frontend) */
export function getProblemsForClient(): Omit<ICodingProblem, 'hiddenTestCases'>[] {
  return CODING_PROBLEMS_SERVER.map(({ hiddenTestCases, ...rest }) => rest);
}

/* ===========================
   Coding Submission — Mongoose Model for persistence
   =========================== */
export interface ICodingSubmission extends Document {
  userId: string;
  problemId: string;
  languageId: number;
  languageName: string;
  sourceCode: string;
  status: string;
  score: number;
  passedTests: number;
  totalTests: number;
  executionTime: string | null;
  memory: number | null;
  submittedAt: Date;
}

const CodingSubmissionSchema = new Schema<ICodingSubmission>(
  {
    userId: { type: String, required: true, index: true },
    problemId: { type: String, required: true },
    languageId: { type: Number, required: true },
    languageName: { type: String, default: '' },
    sourceCode: { type: String, required: true },
    status: { type: String, required: true },
    score: { type: Number, default: 0 },
    passedTests: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    executionTime: { type: String, default: null },
    memory: { type: Number, default: null },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CodingSubmissionModel: mongoose.Model<ICodingSubmission> =
  (mongoose.models.CodingSubmission as mongoose.Model<ICodingSubmission>) ||
  mongoose.model<ICodingSubmission>('CodingSubmission', CodingSubmissionSchema);
