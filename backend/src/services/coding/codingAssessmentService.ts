/**
 * Coding Assessment Service
 * Orchestrates 4-question, 100-mark Coding Assessment generation, evaluation,
 * AI review, and persistence.
 *
 * Scoring Rubric:
 * 1. Easy           — 10 marks
 * 2. Medium         — 20 marks
 * 3. Medium-Hard    — 30 marks
 * 4. Star Challenge — 40 marks (Randomly selected Medium or Hard)
 * Total: 100 marks
 */
import { callAi } from '../interview/interviewAiService.ts';
import { CandidateContextService } from '../candidate/candidateContextService.ts';
import {
  CodingAssessmentModel,
  ICodingAssessment,
  ICodingAssessmentQuestion,
} from '../../models/CodingAssessment.ts';
import { evaluateAgainstTestCases, runCode } from './judge0Service.ts';
import { activities } from '../../models/Dashboard.ts';

export interface AssessmentQuestionData {
  id: string;
  tierIndex: number;
  tierName: 'Easy' | 'Medium' | 'Medium-Hard' | 'Star Challenge';
  originalDifficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  title: string;
  topic: string;
  tags: string[];
  description: string;
  constraints: string[];
  inputSpec: string;
  outputSpec: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: Record<string, string>;
  visibleTestCases: { stdin: string; expectedOutput: string }[];
  hiddenTestCases: { stdin: string; expectedOutput: string }[];
}

export interface ClientAssessmentQuestion {
  id: string;
  tierIndex: number;
  tierName: 'Easy' | 'Medium' | 'Medium-Hard' | 'Star Challenge';
  originalDifficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  title: string;
  topic: string;
  tags: string[];
  description: string;
  constraints: string[];
  inputSpec: string;
  outputSpec: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: Record<string, string>;
  visibleTestCases: { stdin: string; expectedOutput: string }[];
}

/* Server-side in-memory active drafts store so hidden test cases are securely verified */
const activeDraftsStore = new Map<string, { userId: string; questions: AssessmentQuestionData[]; createdAt: number }>();

/* Clean up expired drafts older than 4 hours */
setInterval(() => {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000;
  for (const [id, draft] of activeDraftsStore.entries()) {
    if (draft.createdAt < cutoff) activeDraftsStore.delete(id);
  }
}, 30 * 60 * 1000);

/* Curated Fallback Pool */
const CURATED_QUESTIONS_POOL: AssessmentQuestionData[] = [
  // ── Easy (10 Marks) ──
  {
    id: 'easy_two_sum',
    tierIndex: 0,
    tierName: 'Easy',
    originalDifficulty: 'Easy',
    marks: 10,
    title: 'Two Sum Target Match',
    topic: 'Arrays & Hashing',
    tags: ['Arrays', 'Hash Map'],
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\nAssume exactly one valid solution exists. Output indices separated by space.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    inputSpec: 'Line 1: space-separated integers for nums. Line 2: target integer.',
    outputSpec: 'Two 0-based indices separated by space in increasing order.',
    examples: [
      { input: '2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: '3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' }
    ],
    starterCode: {
      Python: `import sys\n\ndef two_sum(nums, target):\n    # Write your solution here\n    pass\n\nnums = list(map(int, sys.stdin.readline().split()))\ntarget = int(sys.stdin.readline().strip())\n# Print indices separated by space\n`,
      JavaScript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n  const nums = input[0].trim().split(/\\s+/).map(Number);\n  const target = parseInt(input[1].trim(), 10);\n  // Write solution here\n}\n`,
      'C++': `#include <iostream>\n#include <vector>\n#include <sstream>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        istringstream iss(line);\n        vector<int> nums;\n        int x;\n        while (iss >> x) nums.push_back(x);\n        int target;\n        cin >> target;\n        // Write solution here\n    }\n    return 0;\n}\n`,
      Java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            int[] nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n            int target = sc.nextInt();\n            // Write solution here\n        }\n    }\n}\n`
    },
    visibleTestCases: [
      { stdin: '2 7 11 15\n9', expectedOutput: '0 1' },
      { stdin: '3 2 4\n6', expectedOutput: '1 2' }
    ],
    hiddenTestCases: [
      { stdin: '3 3\n6', expectedOutput: '0 1' },
      { stdin: '1 5 8 11 14\n19', expectedOutput: '2 3' },
      { stdin: '-3 4 3 90\n0', expectedOutput: '0 2' }
    ]
  },
  {
    id: 'easy_valid_palindrome',
    tierIndex: 0,
    tierName: 'Easy',
    originalDifficulty: 'Easy',
    marks: 10,
    title: 'Valid Palindrome Checker',
    topic: 'Strings & Two Pointers',
    tags: ['Strings', 'Two Pointers'],
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\nGiven a string `s`, output `true` if it is a palindrome, or `false` otherwise.',
    constraints: ['1 <= s.length <= 10^5', 's consists of ASCII characters.'],
    inputSpec: 'A single line containing string s.',
    outputSpec: '"true" or "false" (lowercase).',
    examples: [
      { input: 'A man, a plan, a canal: Panama', output: 'true', explanation: 'After cleaning: "amanaplanacanalpanama" which is palindrome.' },
      { input: 'race a car', output: 'false', explanation: 'After cleaning: "raceacar" is not palindrome.' }
    ],
    starterCode: {
      Python: `import sys\n\ns = sys.stdin.readline().rstrip('\\n')\n# Write solution here and print 'true' or 'false'\n`,
      JavaScript: `const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');\n// Write solution here and console.log('true' or 'false')\n`,
      'C++': `#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    // Write solution here\n    return 0;\n}\n`,
      Java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : "";\n        // Write solution here\n    }\n}\n`
    },
    visibleTestCases: [
      { stdin: 'A man, a plan, a canal: Panama', expectedOutput: 'true' },
      { stdin: 'race a car', expectedOutput: 'false' }
    ],
    hiddenTestCases: [
      { stdin: ' ', expectedOutput: 'true' },
      { stdin: '0P', expectedOutput: 'false' },
      { stdin: 'No lemon, no melon', expectedOutput: 'true' }
    ]
  },

  // ── Medium (20 Marks) ──
  {
    id: 'med_longest_substring',
    tierIndex: 1,
    tierName: 'Medium',
    originalDifficulty: 'Medium',
    marks: 20,
    title: 'Longest Substring Without Repeating Characters',
    topic: 'Sliding Window',
    tags: ['Sliding Window', 'Hash Set', 'Strings'],
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.\nPrint the length as an integer.',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    inputSpec: 'A single line containing string s.',
    outputSpec: 'An integer representing the maximum length.',
    examples: [
      { input: 'abcabcbb', output: '3', explanation: 'The answer is "abc", length 3.' },
      { input: 'bbbbb', output: '1', explanation: 'The answer is "b", length 1.' }
    ],
    starterCode: {
      Python: `import sys\n\ns = sys.stdin.readline().rstrip('\\n')\n# Write sliding window solution here\n`,
      JavaScript: `const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');\n// Write sliding window solution here\n`,
      'C++': `#include <iostream>\n#include <string>\n#include <unordered_set>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    // Write sliding window solution here\n    return 0;\n}\n`,
      Java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : "";\n        // Write sliding window solution here\n    }\n}\n`
    },
    visibleTestCases: [
      { stdin: 'abcabcbb', expectedOutput: '3' },
      { stdin: 'bbbbb', expectedOutput: '1' }
    ],
    hiddenTestCases: [
      { stdin: 'pwwkew', expectedOutput: '3' },
      { stdin: '', expectedOutput: '0' },
      { stdin: 'dvdf', expectedOutput: '3' }
    ]
  },
  {
    id: 'med_max_subarray',
    tierIndex: 1,
    tierName: 'Medium',
    originalDifficulty: 'Medium',
    marks: 20,
    title: 'Maximum Subarray Sum (Kadane\'s Algorithm)',
    topic: 'Dynamic Programming',
    tags: ['Arrays', 'Dynamic Programming', 'Divide and Conquer'],
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and print its sum.',
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    inputSpec: 'A single line of space-separated integers.',
    outputSpec: 'A single integer representing maximum subarray sum.',
    examples: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4, -1, 2, 1] has the largest sum 6.' },
      { input: '1', output: '1' }
    ],
    starterCode: {
      Python: `import sys\n\nnums = list(map(int, sys.stdin.readline().split()))\n# Implement Kadane's algorithm\n`,
      JavaScript: `const fs = require('fs');\nconst nums = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);\n// Implement Kadane's algorithm\n`,
      'C++': `#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        istringstream iss(line);\n        int x, cur = 0, best = -1e9;\n        // Implement Kadane's algorithm\n    }\n    return 0;\n}\n`,
      Java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] p = sc.nextLine().trim().split("\\\\s+");\n            // Implement Kadane's algorithm\n        }\n    }\n}\n`
    },
    visibleTestCases: [
      { stdin: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' },
      { stdin: '1', expectedOutput: '1' }
    ],
    hiddenTestCases: [
      { stdin: '5 4 -1 7 8', expectedOutput: '23' },
      { stdin: '-5 -4 -2 -9', expectedOutput: '-2' },
      { stdin: '-1 2 3 -4 5 1', expectedOutput: '7' }
    ]
  },

  // ── Medium-Hard (30 Marks) ──
  {
    id: 'medhard_coin_change',
    tierIndex: 2,
    tierName: 'Medium-Hard',
    originalDifficulty: 'Medium',
    marks: 30,
    title: 'Minimum Coin Change',
    topic: 'Dynamic Programming',
    tags: ['Dynamic Programming', 'Breadth-First Search'],
    description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\nReturn the fewest number of coins that you need to make up that amount. If that amount cannot be made up by any combination of the coins, return -1.\nYou may assume that you have an infinite number of each kind of coin.',
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    inputSpec: 'Line 1: space-separated integers for coins. Line 2: integer amount.',
    outputSpec: 'A single integer: minimum coins or -1.',
    examples: [
      { input: '1 2 5\n11', output: '3', explanation: '11 = 5 + 5 + 1 (3 coins)' },
      { input: '2\n3', output: '-1', explanation: '3 cannot be formed using only 2.' }
    ],
    starterCode: {
      Python: `import sys\n\ncoins = list(map(int, sys.stdin.readline().split()))\namount = int(sys.stdin.readline().strip())\n# Compute minimum coins using DP\n`,
      JavaScript: `const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (lines.length >= 2) {\n  const coins = lines[0].trim().split(/\\s+/).map(Number);\n  const amount = parseInt(lines[1].trim(), 10);\n  // Compute minimum coins using DP\n}\n`,
      'C++': `#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        istringstream iss(line);\n        vector<int> coins;\n        int c;\n        while (iss >> c) coins.push_back(c);\n        int amount;\n        cin >> amount;\n        // Compute minimum coins using DP\n    }\n    return 0;\n}\n`,
      Java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            int[] coins = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) coins[i] = Integer.parseInt(parts[i]);\n            int amount = sc.nextInt();\n            // Compute minimum coins using DP\n        }\n    }\n}\n`
    },
    visibleTestCases: [
      { stdin: '1 2 5\n11', expectedOutput: '3' },
      { stdin: '2\n3', expectedOutput: '-1' }
    ],
    hiddenTestCases: [
      { stdin: '1\n0', expectedOutput: '0' },
      { stdin: '1 5 10 25\n30', expectedOutput: '2' },
      { stdin: '186 419 83 408\n6249', expectedOutput: '20' }
    ]
  },
  {
    id: 'medhard_top_k_frequent',
    tierIndex: 2,
    tierName: 'Medium-Hard',
    originalDifficulty: 'Medium',
    marks: 30,
    title: 'Top K Frequent Elements',
    topic: 'Heaps & Hash Maps',
    tags: ['Hash Table', 'Heap', 'Bucket Sort'],
    description: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements in descending order of frequency. If two elements have the same frequency, output the smaller element first.',
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', 'k is in range [1, the number of unique elements in nums].'],
    inputSpec: 'Line 1: space-separated integers for nums. Line 2: integer k.',
    outputSpec: 'k space-separated integers.',
    examples: [
      { input: '1 1 1 2 2 3\n2', output: '1 2', explanation: '1 appears 3 times, 2 appears 2 times.' },
      { input: '1\n1', output: '1' }
    ],
    starterCode: {
      Python: `import sys\n\nnums = list(map(int, sys.stdin.readline().split()))\nk = int(sys.stdin.readline().strip())\n# Print the top k frequent elements separated by space\n`,
      JavaScript: `const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (lines.length >= 2) {\n  const nums = lines[0].trim().split(/\\s+/).map(Number);\n  const k = parseInt(lines[1].trim(), 10);\n  // Print the top k frequent elements\n}\n`,
      'C++': `#include <iostream>\n#include <vector>\n#include <sstream>\n#include <unordered_map>\n#include <queue>\nusing namespace std;\n\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        istringstream iss(line);\n        vector<int> nums;\n        int x; while (iss >> x) nums.push_back(x);\n        int k; cin >> k;\n        // Print top k frequent elements\n    }\n    return 0;\n}\n`,
      Java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] p = sc.nextLine().trim().split("\\\\s+");\n            int[] nums = new int[p.length];\n            for (int i = 0; i < p.length; i++) nums[i] = Integer.parseInt(p[i]);\n            int k = sc.nextInt();\n            // Print top k frequent elements\n        }\n    }\n}\n`
    },
    visibleTestCases: [
      { stdin: '1 1 1 2 2 3\n2', expectedOutput: '1 2' },
      { stdin: '1\n1', expectedOutput: '1' }
    ],
    hiddenTestCases: [
      { stdin: '4 1 -1 2 -1 2 3\n2', expectedOutput: '-1 2' },
      { stdin: '1 2 3 4 5 5 5 5 4 4 4\n3', expectedOutput: '5 4 1' },
      { stdin: '7 7 7 8 8 9\n2', expectedOutput: '7 8' }
    ]
  },

  // ── Star Challenge (40 Marks — Medium/Hard) ──
  {
    id: 'star_trapping_rain_water',
    tierIndex: 3,
    tierName: 'Star Challenge',
    originalDifficulty: 'Hard',
    marks: 40,
    title: 'Trapping Rain Water (Star Challenge)',
    topic: 'Two Pointers & Monotonic Stack',
    tags: ['Two Pointers', 'Stack', 'Dynamic Programming'],
    description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\nOutput the total trapped units as a single integer.',
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    inputSpec: 'A single line containing space-separated non-negative integers for elevation heights.',
    outputSpec: 'A single integer representing trapped water volume.',
    examples: [
      { input: '0 1 0 2 1 0 1 3 2 1 2 1', output: '6', explanation: '6 units of rain water are trapped between bars.' },
      { input: '4 2 0 3 2 5', output: '9', explanation: '9 units of water are trapped.' }
    ],
    starterCode: {
      Python: `import sys\n\nheights = list(map(int, sys.stdin.readline().split()))\n# Calculate trapped water in O(N) time and O(1) space\n`,
      JavaScript: `const fs = require('fs');\nconst heights = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);\n// Calculate trapped water in O(N) time and O(1) space\n`,
      'C++': `#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        istringstream iss(line);\n        vector<int> h;\n        int x; while (iss >> x) h.push_back(x);\n        // Calculate trapped water in O(N)\n    }\n    return 0;\n}\n`,
      Java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            int[] h = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) h[i] = Integer.parseInt(parts[i]);\n            // Calculate trapped water in O(N)\n        }\n    }\n}\n`
    },
    visibleTestCases: [
      { stdin: '0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6' },
      { stdin: '4 2 0 3 2 5', expectedOutput: '9' }
    ],
    hiddenTestCases: [
      { stdin: '3 0 2 0 4', expectedOutput: '7' },
      { stdin: '5 4 1 2', expectedOutput: '1' },
      { stdin: '2 0 2', expectedOutput: '2' }
    ]
  },
  {
    id: 'star_word_break',
    tierIndex: 3,
    tierName: 'Star Challenge',
    originalDifficulty: 'Medium',
    marks: 40,
    title: 'Word Break Segmentation (Star Challenge)',
    topic: 'Dynamic Programming & Trie',
    tags: ['Dynamic Programming', 'Trie', 'Memoization'],
    description: 'Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words, or `false` otherwise.\nYou may reuse dictionary words multiple times.',
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000', '1 <= wordDict[i].length <= 20', 'All characters are lowercase English letters.'],
    inputSpec: 'Line 1: string s. Line 2: space-separated words in wordDict.',
    outputSpec: '"true" or "false" (lowercase).',
    examples: [
      { input: 'leetcode\nleet code', output: 'true', explanation: '"leetcode" can be segmented as "leet code".' },
      { input: 'applepenapple\napple pen', output: 'true', explanation: '"applepenapple" can be segmented as "apple pen apple".' }
    ],
    starterCode: {
      Python: `import sys\n\ns = sys.stdin.readline().strip()\ndict_words = set(sys.stdin.readline().split())\n# Print 'true' or 'false'\n`,
      JavaScript: `const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (lines.length >= 2) {\n  const s = lines[0].trim();\n  const dict = new Set(lines[1].trim().split(/\\s+/));\n  // Print 'true' or 'false'\n}\n`,
      'C++': `#include <iostream>\n#include <string>\n#include <vector>\n#include <unordered_set>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    string s, line;\n    if (getline(cin, s) && getline(cin, line)) {\n        unordered_set<string> dict;\n        istringstream iss(line);\n        string w; while (iss >> w) dict.insert(w);\n        // Print 'true' or 'false'\n    }\n    return 0;\n}\n`,
      Java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String s = sc.nextLine().trim();\n            Set<String> dict = new HashSet<>(Arrays.asList(sc.nextLine().trim().split("\\\\s+")));\n            // Print 'true' or 'false'\n        }\n    }\n}\n`
    },
    visibleTestCases: [
      { stdin: 'leetcode\nleet code', expectedOutput: 'true' },
      { stdin: 'applepenapple\napple pen', expectedOutput: 'true' }
    ],
    hiddenTestCases: [
      { stdin: 'catsandog\ncats dog sand and cat', expectedOutput: 'false' },
      { stdin: 'aaaaaaa\naaaa aaa', expectedOutput: 'true' },
      { stdin: 'cars\ncar ca rs', expectedOutput: 'true' }
    ]
  }
];

export class CodingAssessmentService {
  /**
   * Generates a 4-tier assessment:
   * 1. Easy (10 Marks)
   * 2. Medium (20 Marks)
   * 3. Medium-Hard (30 Marks)
   * 4. Star Challenge (40 Marks - Medium or Hard)
   */
  public static async generateAssessment(userId?: string): Promise<{ assessmentId: string; questions: ClientAssessmentQuestion[] }> {
    const assessmentId = `cast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let candidateSkills: string[] = ['Algorithms', 'Data Structures', 'Problem Solving'];
    let previousQuestionTitles: string[] = [];

    if (userId) {
      try {
        const candidateContext = await CandidateContextService.getCandidateContext(userId);
        if (candidateContext?.skills?.length) {
          candidateSkills = candidateContext.skills.map(s => s.name);
        }
        const pastAssessments = await CodingAssessmentModel.find({ userId }).select('questions.title').lean();
        previousQuestionTitles = pastAssessments.flatMap(a => a.questions?.map(q => q.title) || []);
      } catch (e: any) {
        console.warn('[CodingAssessment] Context lookup note:', e.message);
      }
    }

    // Try AI generation first
    let generatedQuestions: AssessmentQuestionData[] | null = null;
    try {
      generatedQuestions = await this.generateQuestionsWithAi(candidateSkills, previousQuestionTitles);
    } catch (aiErr: any) {
      console.warn('[CodingAssessment] AI generation failed, using curated pool fallback:', aiErr.message);
    }

    // Fallback if AI generation produced fewer than 4 valid questions
    if (!generatedQuestions || generatedQuestions.length < 4) {
      generatedQuestions = this.selectFromCuratedPool(previousQuestionTitles);
    }

    // Cache server-side with hidden test cases
    activeDraftsStore.set(assessmentId, {
      userId: userId || 'anonymous',
      questions: generatedQuestions,
      createdAt: Date.now(),
    });

    // Strip hidden test cases for client
    const clientQuestions: ClientAssessmentQuestion[] = generatedQuestions.map(q => ({
      id: q.id,
      tierIndex: q.tierIndex,
      tierName: q.tierName,
      originalDifficulty: q.originalDifficulty,
      marks: q.marks,
      title: q.title,
      topic: q.topic,
      tags: q.tags,
      description: q.description,
      constraints: q.constraints,
      inputSpec: q.inputSpec,
      outputSpec: q.outputSpec,
      examples: q.examples,
      starterCode: q.starterCode,
      visibleTestCases: q.visibleTestCases,
    }));

    return { assessmentId, questions: clientQuestions };
  }

  /**
   * AI-backed 4-question generator
   */
  private static async generateQuestionsWithAi(skills: string[], previousTitles: string[]): Promise<AssessmentQuestionData[] | null> {
    const starDifficulty = Math.random() > 0.5 ? 'Hard' : 'Medium';
    const systemPrompt = `You are an expert algorithmic assessment designer at SkillNexus.
Create exactly 4 progressive coding questions with exact specifications for input and output, starter codes for Python, JavaScript, C++, Java, and test cases.`;

    const userPrompt = `
Candidate skills: ${skills.join(', ')}
Previously asked questions to strictly EXCLUDE: ${previousTitles.slice(-20).join(', ') || 'None'}

Generate exactly 4 distinct programming problems adhering to these 4 tiers:
Tier 1: "Easy" — 10 marks (Fundamental array/string/math logic)
Tier 2: "Medium" — 20 marks (Sliding window/hash table/two pointers/binary search)
Tier 3: "Medium-Hard" — 30 marks (Dynamic programming/heap/graphs/intervals)
Tier 4: "Star Challenge" — 40 marks (${starDifficulty} algorithmic depth, e.g. monotonic stack/trees/DP/two pointers)

STRICT FORMAT REQUIREMENT:
Return a JSON object with a "questions" array containing exactly 4 objects.
Each object must have:
- "title": string
- "tierName": "Easy" | "Medium" | "Medium-Hard" | "Star Challenge"
- "originalDifficulty": "Easy" | "Medium" | "Hard"
- "marks": 10 for Q1, 20 for Q2, 30 for Q3, 40 for Q4
- "topic": string
- "tags": string[]
- "description": string
- "constraints": string[]
- "inputSpec": string
- "outputSpec": string
- "examples": [{ "input": string, "output": string, "explanation": string }]
- "starterCode": { "Python": string, "JavaScript": string, "C++": string, "Java": string }
- "visibleTestCases": [{ "stdin": string, "expectedOutput": string }] (at least 2 cases)
- "hiddenTestCases": [{ "stdin": string, "expectedOutput": string }] (at least 3 edge cases)

STRICT RULE: Only output valid JSON with no conversational text or markdown fences.
`;

    const raw = await callAi(userPrompt, systemPrompt);
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed.questions) && parsed.questions.length >= 4) {
      const tiers: ('Easy' | 'Medium' | 'Medium-Hard' | 'Star Challenge')[] = [
        'Easy',
        'Medium',
        'Medium-Hard',
        'Star Challenge',
      ];
      const marksList = [10, 20, 30, 40];

      return parsed.questions.slice(0, 4).map((q: any, i: number) => ({
        id: `ai_q_${i + 1}_${Date.now()}`,
        tierIndex: i,
        tierName: tiers[i],
        originalDifficulty: i === 0 ? 'Easy' : i === 3 ? (starDifficulty as any) : 'Medium',
        marks: marksList[i],
        title: q.title || `${tiers[i]} Challenge`,
        topic: q.topic || 'Algorithms',
        tags: Array.isArray(q.tags) ? q.tags : ['Algorithms'],
        description: q.description || '',
        constraints: Array.isArray(q.constraints) ? q.constraints : ['1 <= N <= 10^5'],
        inputSpec: q.inputSpec || 'Standard input',
        outputSpec: q.outputSpec || 'Standard output',
        examples: Array.isArray(q.examples) ? q.examples : [],
        starterCode: q.starterCode || CURATED_QUESTIONS_POOL[i * 2]?.starterCode,
        visibleTestCases: Array.isArray(q.visibleTestCases) && q.visibleTestCases.length > 0
          ? q.visibleTestCases
          : [{ stdin: '1 2', expectedOutput: '3' }],
        hiddenTestCases: Array.isArray(q.hiddenTestCases) && q.hiddenTestCases.length > 0
          ? q.hiddenTestCases
          : [{ stdin: '0 0', expectedOutput: '0' }],
      }));
    }

    return null;
  }

  /**
   * Selects 4 questions from curated pool ensuring diversity and minimizing repetition
   */
  private static selectFromCuratedPool(previousTitles: string[]): AssessmentQuestionData[] {
    const prevSet = new Set(previousTitles.map(t => t.toLowerCase()));
    const result: AssessmentQuestionData[] = [];

    for (let tierIdx = 0; tierIdx < 4; tierIdx++) {
      const candidates = CURATED_QUESTIONS_POOL.filter(q => q.tierIndex === tierIdx);
      const unasked = candidates.filter(q => !prevSet.has(q.title.toLowerCase()));
      const selected = unasked.length > 0
        ? unasked[Math.floor(Math.random() * unasked.length)]
        : candidates[Math.floor(Math.random() * candidates.length)];
      result.push(selected);
    }

    return result;
  }

  /**
   * Retrieves server-side question definition for an active draft
   */
  public static getDraftQuestion(assessmentId: string, questionId: string): AssessmentQuestionData | null {
    const draft = activeDraftsStore.get(assessmentId);
    if (!draft) {
      // Fallback: check curated pool
      return CURATED_QUESTIONS_POOL.find(q => q.id === questionId) || null;
    }
    return draft.questions.find(q => q.id === questionId) || null;
  }

  /**
   * Evaluates a single question against all test cases (visible + hidden) using Judge0/Wandbox
   * and runs AI code evaluation
   */
  public static async evaluateQuestion(params: {
    assessmentId: string;
    questionId: string;
    languageId: number;
    languageName: string;
    sourceCode: string;
  }) {
    const question = this.getDraftQuestion(params.assessmentId, params.questionId);
    if (!question) {
      throw new Error('Question not found in active assessment.');
    }

    const allTestCases = [...question.visibleTestCases, ...question.hiddenTestCases];

    // Authoritative execution
    const executionResult = await evaluateAgainstTestCases({
      languageId: params.languageId,
      sourceCode: params.sourceCode,
      testCases: allTestCases,
    });

    // Correctness score calculation:
    // (Passed Test Cases / Total Valid Test Cases) × Maximum Marks
    const maxMarks = question.marks;
    const passedTests = executionResult.passedTests;
    const totalTests = executionResult.totalTests;
    const calculatedScore = totalTests > 0
      ? Math.round(((passedTests / totalTests) * maxMarks) * 100) / 100
      : 0;

    // AI Code Review
    let aiReview = {
      feedback: 'Solution submitted. Review logic and edge case coverage.',
      strengths: ['Clean code structure.'],
      improvements: ['Consider optimal time and space complexity.'],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    };

    try {
      aiReview = await this.generateCodeReview({
        title: question.title,
        problemDescription: question.description,
        language: params.languageName,
        sourceCode: params.sourceCode,
        passedTests,
        totalTests,
        status: executionResult.status,
      });
    } catch (e: any) {
      console.warn('[CodingAssessment] AI code review notice:', e.message);
    }

    // Mask hidden test cases
    const visibleCount = question.visibleTestCases.length;
    const safeTestResults = executionResult.testResults.map((tr, idx) => {
      if (idx < visibleCount) {
        return { ...tr, isHidden: false };
      }
      return {
        testCaseIndex: tr.testCaseIndex,
        passed: tr.passed,
        status: tr.status,
        stdout: null,
        stderr: tr.stderr,
        compileOutput: tr.compileOutput,
        expectedOutput: '(hidden)',
        actualOutput: null,
        time: tr.time,
        memory: tr.memory,
        isHidden: true,
      };
    });

    return {
      questionId: question.id,
      title: question.title,
      tierName: question.tierName,
      maxMarks,
      score: calculatedScore,
      passedTests,
      totalTests,
      status: executionResult.status,
      executionTime: executionResult.averageTime,
      memory: executionResult.averageMemory,
      testResults: safeTestResults,
      aiReview,
    };
  }

  /**
   * Generates AI Code Review & Feedback
   */
  private static async generateCodeReview(params: {
    title: string;
    problemDescription: string;
    language: string;
    sourceCode: string;
    passedTests: number;
    totalTests: number;
    status: string;
  }) {
    const systemPrompt = `You are a Principal Software Engineer and Staff Code Reviewer.
Evaluate the candidate's solution code objectively. Provide concise, constructive code-quality feedback, identify algorithmic strengths, suggest concrete improvements, and infer Big-O complexity.`;

    const userPrompt = `
Problem: ${params.title}
Language: ${params.language}
Execution Status: ${params.status} (${params.passedTests}/${params.totalTests} tests passed)
Submitted Code:
\`\`\`
${params.sourceCode.slice(0, 3000)}
\`\`\`

Return STRICTLY valid JSON with no markdown formatting:
{
  "feedback": "20-30 words summary of solution approach and code hygiene",
  "strengths": ["1-2 concise strengths regarding logic or implementation"],
  "improvements": ["1-2 actionable optimization or clean-code tips"],
  "timeComplexity": "e.g. O(N) or O(N log N)",
  "spaceComplexity": "e.g. O(1) or O(N)"
}
`;

    const raw = await callAi(userPrompt, systemPrompt);
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      feedback: parsed.feedback || `Passed ${params.passedTests}/${params.totalTests} test cases.`,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : ['Good structural clarity.'],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : ['Check edge cases.'],
      timeComplexity: parsed.timeComplexity || 'O(N)',
      spaceComplexity: parsed.spaceComplexity || 'O(1)',
    };
  }

  /**
   * Persists a completed assessment to MongoDB
   */
  public static async submitAssessment(params: {
    userId: string;
    assessmentId: string;
    questions: ICodingAssessmentQuestion[];
    durationMinutes?: number;
  }): Promise<ICodingAssessment> {
    const easyQ = params.questions.find(q => q.difficulty === 'Easy') || params.questions[0];
    const mediumQ = params.questions.find(q => q.difficulty === 'Medium') || params.questions[1];
    const medHardQ = params.questions.find(q => q.difficulty === 'Medium-Hard') || params.questions[2];
    const starQ = params.questions.find(q => q.difficulty === 'Star Challenge') || params.questions[3];

    const easyScore = Math.min(10, Math.max(0, Number(easyQ?.score) || 0));
    const mediumScore = Math.min(20, Math.max(0, Number(mediumQ?.score) || 0));
    const mediumHardScore = Math.min(30, Math.max(0, Number(medHardQ?.score) || 0));
    const starChallengeScore = Math.min(40, Math.max(0, Number(starQ?.score) || 0));

    // Total Score = Easy + Medium + Medium-Hard + Star Challenge (out of 100)
    const rawTotal = easyScore + mediumScore + mediumHardScore + starChallengeScore;
    const totalScore = Math.round(rawTotal * 100) / 100;

    // Detect weak areas based on question scores
    const weakAreas: string[] = [];
    const recommendedTopics: string[] = [];

    params.questions.forEach(q => {
      const ratio = q.marks > 0 ? q.score / q.marks : 0;
      if (ratio < 0.7) {
        weakAreas.push(`${q.title} (${q.difficulty})`);
      } else {
        recommendedTopics.push(q.title);
      }
    });

    const overallFeedback = totalScore >= 80
      ? `Exceptional performance! Mastered algorithmic problem solving with ${totalScore}/100 marks.`
      : totalScore >= 60
      ? `Strong algorithmic foundation (${totalScore}/100 marks). Focus on optimization in complex challenges.`
      : `Good attempt with ${totalScore}/100 marks. Review core data structure patterns and edge cases.`;

    // Persist to MongoDB
    const assessment = await CodingAssessmentModel.create({
      userId: params.userId,
      assessmentId: params.assessmentId,
      title: 'SkillNexus 4-Tier Coding Assessment',
      totalScore,
      easyScore,
      mediumScore,
      mediumHardScore,
      starChallengeScore,
      status: 'completed',
      questions: params.questions,
      overallFeedback,
      weakAreas,
      recommendedTopics,
      durationMinutes: params.durationMinutes || 45,
      completedAt: new Date(),
    });

    // Record activity
    activities.unshift({
      id: `act_${Date.now()}`,
      title: 'Completed Coding Assessment',
      subtitle: `Scored ${totalScore}/100 marks • Just now`,
      timeAgo: 'Just now',
      type: 'dsa',
    });

    // Clear draft from active cache
    activeDraftsStore.delete(params.assessmentId);

    return assessment;
  }
}
