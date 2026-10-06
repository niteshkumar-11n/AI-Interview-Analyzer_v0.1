export interface TestCase {
  id: number;
  label: string;
  input: string;
  target?: string;
  expectedOutput: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingProblem {
  id: string;
  number: number;
  totalInTopic: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  tags: string[];
  description: string;
  notes?: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: {
    'C++': string;
    'Python': string;
    'JavaScript': string;
    'Java': string;
  };
  optimalCode: {
    'C++': string;
    'Python': string;
    'JavaScript': string;
    'Java': string;
  };
  testCases: TestCase[];
  timeComplexity: string;
  spaceComplexity: string;
  approach: {
    title: string;
    explanation: string;
    steps: string[];
  };
  similarProblems: {
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
  }[];
}

export const TOPICS = [
  { id: 'Arrays', name: 'Arrays', count: 124, icon: 'grid' },
  { id: 'Strings', name: 'Strings', count: 98, icon: 'type' },
  { id: 'Linked List', name: 'Linked List', count: 76, icon: 'link' },
  { id: 'Stack', name: 'Stack', count: 54, icon: 'layers' },
  { id: 'Queue', name: 'Queue', count: 48, icon: 'git-commit' },
  { id: 'Trees', name: 'Trees', count: 102, icon: 'network' },
  { id: 'Graph', name: 'Graph', count: 96, icon: 'share-2' },
  { id: 'Dynamic Programming', name: 'Dynamic Programming', count: 110, icon: 'cpu' },
];

export const CODING_PROBLEMS: Record<string, CodingProblem[]> = {
  Arrays: [
    {
      id: 'two-sum',
      number: 1,
      totalInTopic: 50,
      title: 'Two Sum',
      difficulty: 'Medium',
      topic: 'Arrays',
      tags: ['Arrays', 'Hash Table'],
      description: 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
      examples: [
        {
          input: 'nums = [2, 7, 11, 15], target = 9',
          output: '[0, 1]',
          explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, return [0, 1].'
        },
        {
          input: 'nums = [3, 2, 4], target = 6',
          output: '[1, 2]'
        }
      ],
      constraints: [
        '2 ≤ nums.length ≤ 10⁴',
        '-10⁹ ≤ nums[i] ≤ 10⁹',
        '-10⁹ ≤ target ≤ 10⁹',
        'Only one valid answer exists.'
      ],
      starterCode: {
        'C++': `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};`,
        'Python': `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass`,
        'JavaScript': `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your code here\n};`,
        'Java': `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`
      },
      optimalCode: {
        'C++': `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> numMap;\n        for (int i = 0; i < nums.size(); ++i) {\n            int complement = target - nums[i];\n            if (numMap.find(complement) != numMap.end()) {\n                return {numMap[complement], i};\n            }\n            numMap[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
        'Python': `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        lookup = {}\n        for i, num in enumerate(nums):\n            complement = target - num\n            if complement in lookup:\n                return [lookup[complement], i]\n            lookup[num] = i\n        return []`,
        'JavaScript': `var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};`,
        'Java': `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`
      },
      testCases: [
        { id: 1, label: 'Test Case 1', input: 'nums = [2, 7, 11, 15]\ntarget = 9', expectedOutput: '[0, 1]' },
        { id: 2, label: 'Test Case 2', input: 'nums = [3, 2, 4]\ntarget = 6', expectedOutput: '[1, 2]' },
        { id: 3, label: 'Test Case 3', input: 'nums = [3, 3]\ntarget = 6', expectedOutput: '[0, 1]' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      approach: {
        title: 'One-Pass Hash Map Technique',
        explanation: 'While iterating through the array, we check if the complement (target - nums[i]) already exists in our hash table. If yes, we have found our pair. Otherwise, we store the current number and its index.',
        steps: [
          'Initialize an empty hash table to store values and their array indices.',
          'Iterate across each element in nums with index i.',
          'Calculate complement = target - nums[i].',
          'If complement is present in hash table, return [storedIndex, i].',
          'Otherwise, insert nums[i] with index i into the hash table.'
        ]
      },
      similarProblems: [
        { title: '3Sum', difficulty: 'Medium', topic: 'Arrays' },
        { title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Medium', topic: 'Arrays' },
        { title: 'Subarray Sum Equals K', difficulty: 'Medium', topic: 'Hash Table' },
        { title: '4Sum', difficulty: 'Hard', topic: 'Arrays' }
      ]
    },
    {
      id: 'best-time-stock',
      number: 2,
      totalInTopic: 50,
      title: 'Best Time to Buy and Sell Stock',
      difficulty: 'Easy',
      topic: 'Arrays',
      tags: ['Arrays', 'Dynamic Programming'],
      description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
      examples: [
        { input: 'prices = [7, 1, 5, 3, 6, 4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.' },
        { input: 'prices = [7, 6, 4, 3, 1]', output: '0', explanation: 'No transactions are done, max profit = 0.' }
      ],
      constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
      starterCode: {
        'C++': `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your code here\n    }\n};`,
        'Python': `class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        # Write your code here\n        pass`,
        'JavaScript': `var maxProfit = function(prices) {\n    // Write your code here\n};`,
        'Java': `class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}`
      },
      optimalCode: {
        'C++': `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int minPrice = INT_MAX, maxProfit = 0;\n        for (int price : prices) {\n            minPrice = min(minPrice, price);\n            maxProfit = max(maxProfit, price - minPrice);\n        }\n        return maxProfit;\n    }\n};`,
        'Python': `class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        min_price = float('inf')\n        max_profit = 0\n        for price in prices:\n            min_price = min(min_price, price)\n            max_profit = max(max_profit, price - min_price)\n        return max_profit`,
        'JavaScript': `var maxProfit = function(prices) {\n    let minPrice = Infinity;\n    let maxProfit = 0;\n    for (const price of prices) {\n        minPrice = Math.min(minPrice, price);\n        maxProfit = Math.max(maxProfit, price - minPrice);\n    }\n    return maxProfit;\n};`,
        'Java': `class Solution {\n    public int maxProfit(int[] prices) {\n        int minPrice = Integer.MAX_VALUE;\n        int maxProfit = 0;\n        for (int price : prices) {\n            minPrice = Math.min(minPrice, price);\n            maxProfit = Math.max(maxProfit, price - minPrice);\n        }\n        return maxProfit;\n    }\n}`
      },
      testCases: [
        { id: 1, label: 'Test Case 1', input: 'prices = [7, 1, 5, 3, 6, 4]', expectedOutput: '5' },
        { id: 2, label: 'Test Case 2', input: 'prices = [7, 6, 4, 3, 1]', expectedOutput: '0' },
        { id: 3, label: 'Test Case 3', input: 'prices = [2, 4, 1]', expectedOutput: '2' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      approach: {
        title: 'Greedy Single-Pass Min Tracking',
        explanation: 'Track minimum price encountered so far and calculate profit on every day.',
        steps: [
          'Maintain minPrice initialized to infinity and maxProfit to 0.',
          'Iterate through prices list.',
          'Update minPrice if current price is lower.',
          'Calculate current profit and update maxProfit if higher.'
        ]
      },
      similarProblems: [
        { title: 'Best Time to Buy and Sell Stock II', difficulty: 'Medium', topic: 'Arrays' },
        { title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Arrays' }
      ]
    }
  ],
  Strings: [
    {
      id: 'valid-anagram',
      number: 1,
      totalInTopic: 45,
      title: 'Valid Anagram',
      difficulty: 'Easy',
      topic: 'Strings',
      tags: ['Strings', 'Hash Table'],
      description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.',
      examples: [
        { input: 's = "anagram", t = "nagaram"', output: 'true' },
        { input: 's = "rat", t = "car"', output: 'false' }
      ],
      constraints: ['1 ≤ s.length, t.length ≤ 5 * 10⁴', 's and t consist of lowercase English letters.'],
      starterCode: {
        'C++': `class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        // Write your code here\n    }\n};`,
        'Python': `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass`,
        'JavaScript': `var isAnagram = function(s, t) {\n    // Write your code here\n};`,
        'Java': `class Solution {\n    public boolean isAnagram(String s, String t) {\n        return false;\n    }\n}`
      },
      optimalCode: {
        'C++': `class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.length() != t.length()) return false;\n        int count[26] = {0};\n        for (char c : s) count[c - 'a']++;\n        for (char c : t) if (--count[c - 'a'] < 0) return false;\n        return true;\n    }\n};`,
        'Python': `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        return collections.Counter(s) == collections.Counter(t)`,
        'JavaScript': `var isAnagram = function(s, t) {\n    if (s.length !== t.length) return false;\n    const counts = {};\n    for (let c of s) counts[c] = (counts[c] || 0) + 1;\n    for (let c of t) {\n        if (!counts[c]) return false;\n        counts[c]--;\n    }\n    return true;\n};`,
        'Java': `class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (char c : s.toCharArray()) count[c - 'a']++;\n        for (char c : t.toCharArray()) if (--count[c - 'a'] < 0) return false;\n        return true;\n    }\n}`
      },
      testCases: [
        { id: 1, label: 'Test Case 1', input: 's = "anagram", t = "nagaram"', expectedOutput: 'true' },
        { id: 2, label: 'Test Case 2', input: 's = "rat", t = "car"', expectedOutput: 'false' },
        { id: 3, label: 'Test Case 3', input: 's = "a", t = "ab"', expectedOutput: 'false' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      approach: {
        title: 'Frequency Counter Array',
        explanation: 'Count character occurrences across 26 letters.',
        steps: ['Check length equality', 'Increment for s, decrement for t', 'Ensure all buckets equal zero']
      },
      similarProblems: [
        { title: 'Group Anagrams', difficulty: 'Medium', topic: 'Strings' }
      ]
    }
  ],
  'Linked List': [
    {
      id: 'reverse-linked-list',
      number: 1,
      totalInTopic: 35,
      title: 'Reverse Linked List',
      difficulty: 'Easy',
      topic: 'Linked List',
      tags: ['Linked List', 'Recursion'],
      description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
      examples: [
        { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
        { input: 'head = [1,2]', output: '[2,1]' }
      ],
      constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 ≤ Node.val ≤ 5000'],
      starterCode: {
        'C++': `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your code here\n    }\n};`,
        'Python': `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        pass`,
        'JavaScript': `var reverseList = function(head) {\n    // Write your code here\n};`,
        'Java': `class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}`
      },
      optimalCode: {
        'C++': `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode* prev = nullptr;\n        ListNode* curr = head;\n        while (curr != nullptr) {\n            ListNode* nextTemp = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n};`,
        'Python': `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev = None\n        curr = head\n        while curr:\n            next_temp = curr.next\n            curr.next = prev\n            prev = curr\n            curr = next_temp\n        return prev`,
        'JavaScript': `var reverseList = function(head) {\n    let prev = null, curr = head;\n    while (curr !== null) {\n        let nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n};`,
        'Java': `class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nextTemp = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n}`
      },
      testCases: [
        { id: 1, label: 'Test Case 1', input: 'head = [1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
        { id: 2, label: 'Test Case 2', input: 'head = [1,2]', expectedOutput: '[2,1]' },
        { id: 3, label: 'Test Case 3', input: 'head = []', expectedOutput: '[]' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      approach: {
        title: 'Iterative 3-Pointer Inversion',
        explanation: 'Store the next node, reverse pointer backwards to prev, and advance.',
        steps: ['Initialize prev to null', 'Loop while curr is not null', 'Save next pointer', 'Assign curr.next = prev', 'Move prev and curr forward']
      },
      similarProblems: [
        { title: 'Reverse Linked List II', difficulty: 'Medium', topic: 'Linked List' }
      ]
    }
  ],
  Stack: [
    {
      id: 'valid-parentheses',
      number: 1,
      totalInTopic: 30,
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      topic: 'Stack',
      tags: ['Stack', 'String'],
      description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if open brackets must be closed by the same type of brackets in the correct order.',
      examples: [
        { input: 's = "()"', output: 'true' },
        { input: 's = "()[]{}"', output: 'true' },
        { input: 's = "(]"', output: 'false' }
      ],
      constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only \'()[]{}\'.'],
      starterCode: {
        'C++': `class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n    }\n};`,
        'Python': `class Solution:\n    def isValid(self, s: str) -> bool:\n        pass`,
        'JavaScript': `var isValid = function(s) {\n    // Write your code here\n};`,
        'Java': `class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}`
      },
      optimalCode: {
        'C++': `class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(') st.push(')');\n            else if (c == '{') st.push('}');\n            else if (c == '[') st.push(']');\n            else if (st.empty() || st.top() != c) return false;\n            else st.pop();\n        }\n        return st.empty();\n    }\n};`,
        'Python': `class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {')': '(', '}': '{', ']': '['}\n        for char in s:\n            if char in mapping:\n                top = stack.pop() if stack else '#'\n                if mapping[char] != top: return False\n            else: stack.append(char)\n        return not stack`,
        'JavaScript': `var isValid = function(s) {\n    const stack = [];\n    const map = { ')': '(', '}': '{', ']': '[' };\n    for (let char of s) {\n        if (map[char]) {\n            if (stack.pop() !== map[char]) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n};`,
        'Java': `class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}`
      },
      testCases: [
        { id: 1, label: 'Test Case 1', input: 's = "()"', expectedOutput: 'true' },
        { id: 2, label: 'Test Case 2', input: 's = "()[]{}"', expectedOutput: 'true' },
        { id: 3, label: 'Test Case 3', input: 's = "(]"', expectedOutput: 'false' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      approach: {
        title: 'Stack-Based Bracket Matching',
        explanation: 'Push corresponding expected close brackets onto stack whenever opening bracket is observed.',
        steps: ['Iterate through characters', 'Push matching closing bracket', 'If closing bracket, verify with stack top', 'Return true if stack empty']
      },
      similarProblems: [
        { title: 'Generate Parentheses', difficulty: 'Medium', topic: 'Stack' },
        { title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', topic: 'Stack' }
      ]
    }
  ],
  Queue: [
    {
      id: 'queue-using-stacks',
      number: 1,
      totalInTopic: 20,
      title: 'Implement Queue using Stacks',
      difficulty: 'Easy',
      topic: 'Queue',
      tags: ['Stack', 'Queue', 'Design'],
      description: 'Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).',
      examples: [
        { input: '["MyQueue", "push", "push", "peek", "pop", "empty"]\n[[], [1], [2], [], [], []]', output: '[null, null, null, 1, 1, false]' }
      ],
      constraints: ['1 ≤ x ≤ 9', 'At most 100 calls will be made to push, pop, peek, and empty.'],
      starterCode: {
        'C++': `class MyQueue {\npublic:\n    MyQueue() {}\n    void push(int x) {}\n    int pop() { return 0; }\n    int peek() { return 0; }\n    bool empty() { return true; }\n};`,
        'Python': `class MyQueue:\n    def __init__(self):\n        pass`,
        'JavaScript': `var MyQueue = function() {};`,
        'Java': `class MyQueue {\n    public MyQueue() {}\n}`
      },
      optimalCode: {
        'C++': `class MyQueue {\n    stack<int> s1, s2;\npublic:\n    void push(int x) { s1.push(x); }\n    int pop() {\n        peek();\n        int val = s2.top();\n        s2.pop();\n        return val;\n    }\n    int peek() {\n        if (s2.empty()) {\n            while (!s1.empty()) {\n                s2.push(s1.top());\n                s1.pop();\n            }\n        }\n        return s2.top();\n    }\n    bool empty() { return s1.empty() && s2.empty(); }\n};`,
        'Python': `class MyQueue:\n    def __init__(self):\n        self.s1 = []\n        self.s2 = []\n    def push(self, x: int) -> None:\n        self.s1.append(x)\n    def pop(self) -> int:\n        self.peek()\n        return self.s2.pop()\n    def peek(self) -> int:\n        if not self.s2:\n            while self.s1: self.s2.append(self.s1.pop())\n        return self.s2[-1]\n    def empty(self) -> bool:\n        return not self.s1 and not self.s2`,
        'JavaScript': `var MyQueue = function() {\n    this.s1 = [];\n    this.s2 = [];\n};\nMyQueue.prototype.push = function(x) { this.s1.push(x); };\nMyQueue.prototype.pop = function() {\n    this.peek();\n    return this.s2.pop();\n};\nMyQueue.prototype.peek = function() {\n    if (this.s2.length === 0) {\n        while (this.s1.length > 0) this.s2.push(this.s1.pop());\n    }\n    return this.s2[this.s2.length - 1];\n};\nMyQueue.prototype.empty = function() { return this.s1.length === 0 && this.s2.length === 0; };`,
        'Java': `class MyQueue {\n    private Stack<Integer> s1 = new Stack<>();\n    private Stack<Integer> s2 = new Stack<>();\n    public void push(int x) { s1.push(x); }\n    public int pop() { peek(); return s2.pop(); }\n    public int peek() {\n        if (s2.isEmpty()) {\n            while (!s1.isEmpty()) s2.push(s1.pop());\n        }\n        return s2.peek();\n    }\n    public boolean empty() { return s1.isEmpty() && s2.isEmpty(); }\n}`
      },
      testCases: [
        { id: 1, label: 'Test Case 1', input: 'push(1), push(2), peek()', expectedOutput: '1' },
        { id: 2, label: 'Test Case 2', input: 'pop()', expectedOutput: '1' },
        { id: 3, label: 'Test Case 3', input: 'empty()', expectedOutput: 'false' }
      ],
      timeComplexity: 'Amortized O(1)',
      spaceComplexity: 'O(n)',
      approach: {
        title: 'Two-Stack Amortized Transfer',
        explanation: 'Keep input stack and output stack. Only pour when output stack is exhausted.',
        steps: ['Push directly to s1', 'When popping or peeking, pour s1 reverse into s2 if s2 empty', 'Read from top of s2']
      },
      similarProblems: [
        { title: 'Implement Stack using Queues', difficulty: 'Easy', topic: 'Queue' }
      ]
    }
  ],
  Trees: [
    {
      id: 'invert-binary-tree',
      number: 1,
      totalInTopic: 40,
      title: 'Invert Binary Tree',
      difficulty: 'Easy',
      topic: 'Trees',
      tags: ['Tree', 'Depth-First Search', 'Breadth-First Search'],
      description: 'Given the root of a binary tree, invert the tree, and return its root.',
      examples: [
        { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
        { input: 'root = [2,1,3]', output: '[2,3,1]' }
      ],
      constraints: ['The number of nodes in the tree is in the range [0, 100].', '-100 ≤ Node.val ≤ 100'],
      starterCode: {
        'C++': `class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        // Write your code here\n    }\n};`,
        'Python': `class Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        pass`,
        'JavaScript': `var invertTree = function(root) {\n    // Write your code here\n};`,
        'Java': `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        return null;\n    }\n}`
      },
      optimalCode: {
        'C++': `class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (!root) return nullptr;\n        TreeNode* temp = root->left;\n        root->left = invertTree(root->right);\n        root->right = invertTree(temp);\n        return root;\n    }\n};`,
        'Python': `class Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        if not root: return None\n        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)\n        return root`,
        'JavaScript': `var invertTree = function(root) {\n    if (!root) return null;\n    const temp = root.left;\n    root.left = invertTree(root.right);\n    root.right = invertTree(temp);\n    return root;\n};`,
        'Java': `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode temp = root.left;\n        root.left = invertTree(root.right);\n        root.right = invertTree(temp);\n        return root;\n    }\n}`
      },
      testCases: [
        { id: 1, label: 'Test Case 1', input: 'root = [4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]' },
        { id: 2, label: 'Test Case 2', input: 'root = [2,1,3]', expectedOutput: '[2,3,1]' },
        { id: 3, label: 'Test Case 3', input: 'root = []', expectedOutput: '[]' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      approach: {
        title: 'Recursive Mirror Swap',
        explanation: 'Recursively swap left and right child pointers down to leaf nodes.',
        steps: ['Base case: return null if node is null', 'Recursively call invert on right and left', 'Swap pointers', 'Return root']
      },
      similarProblems: [
        { title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'Trees' },
        { title: 'Validate Binary Search Tree', difficulty: 'Medium', topic: 'Trees' }
      ]
    }
  ],
  Graph: [
    {
      id: 'number-of-islands',
      number: 1,
      totalInTopic: 38,
      title: 'Number of Islands',
      difficulty: 'Medium',
      topic: 'Graph',
      tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Matrix'],
      description: 'Given an m x n 2D binary grid grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
      examples: [
        {
          input: 'grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]',
          output: '1'
        },
        {
          input: 'grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]',
          output: '3'
        }
      ],
      constraints: ['m == grid.length', 'n == grid[i].length', '1 ≤ m, n ≤ 300', 'grid[i][j] is \'0\' or \'1\'.'],
      starterCode: {
        'C++': `class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your code here\n    }\n};`,
        'Python': `class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        pass`,
        'JavaScript': `var numIslands = function(grid) {\n    // Write your code here\n};`,
        'Java': `class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}`
      },
      optimalCode: {
        'C++': `class Solution {\n    void dfs(vector<vector<char>>& grid, int r, int c) {\n        if (r < 0 || c < 0 || r >= grid.size() || c >= grid[0].size() || grid[r][c] != '1') return;\n        grid[r][c] = '0';\n        dfs(grid, r+1, c); dfs(grid, r-1, c); dfs(grid, r, c+1); dfs(grid, r, c-1);\n    }\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        int count = 0;\n        for (int i = 0; i < grid.size(); ++i) {\n            for (int j = 0; j < grid[0].size(); ++j) {\n                if (grid[i][j] == '1') {\n                    count++;\n                    dfs(grid, i, j);\n                }\n            }\n        }\n        return count;\n    }\n};`,
        'Python': `class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        if not grid: return 0\n        m, n = len(grid), len(grid[0])\n        count = 0\n        def dfs(r, c):\n            if r < 0 or c < 0 or r >= m or c >= n or grid[r][c] != '1': return\n            grid[r][c] = '0'\n            dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n        for r in range(m):\n            for c in range(n):\n                if grid[r][c] == '1':\n                    count += 1\n                    dfs(r, c)\n        return count`,
        'JavaScript': `var numIslands = function(grid) {\n    if (!grid.length) return 0;\n    let count = 0;\n    const dfs = (r, c) => {\n        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);\n    };\n    for (let r = 0; r < grid.length; r++) {\n        for (let c = 0; c < grid[0].length; c++) {\n            if (grid[r][c] === '1') {\n                count++;\n                dfs(r, c);\n            }\n        }\n    }\n    return count;\n};`,
        'Java': `class Solution {\n    public int numIslands(char[][] grid) {\n        int count = 0;\n        for (int i = 0; i < grid.length; i++) {\n            for (int j = 0; j < grid[0].length; j++) {\n                if (grid[i][j] == '1') {\n                    count++;\n                    dfs(grid, i, j);\n                }\n            }\n        }\n        return count;\n    }\n    private void dfs(char[][] grid, int r, int c) {\n        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') return;\n        grid[r][c] = '0';\n        dfs(grid, r+1, c); dfs(grid, r-1, c); dfs(grid, r, c+1); dfs(grid, r, c-1);\n    }\n}`
      },
      testCases: [
        { id: 1, label: 'Test Case 1', input: 'grid = 4x5, 1 island', expectedOutput: '1' },
        { id: 2, label: 'Test Case 2', input: 'grid = 4x5, 3 islands', expectedOutput: '3' },
        { id: 3, label: 'Test Case 3', input: 'grid = [["0"]]', expectedOutput: '0' }
      ],
      timeComplexity: 'O(m × n)',
      spaceComplexity: 'O(m × n)',
      approach: {
        title: 'DFS Connected Component Sink',
        explanation: 'When visiting a 1, increment island count and sink all adjacent 1s to 0 using DFS traversal.',
        steps: ['Iterate through grid cells', 'On encountering 1, increment island counter', 'Trigger DFS to sink all connected 1 cells into 0', 'Return total count']
      },
      similarProblems: [
        { title: 'Max Area of Island', difficulty: 'Medium', topic: 'Graph' },
        { title: 'Clone Graph', difficulty: 'Medium', topic: 'Graph' }
      ]
    }
  ],
  'Dynamic Programming': [
    {
      id: 'climbing-stairs',
      number: 1,
      totalInTopic: 42,
      title: 'Climbing Stairs',
      difficulty: 'Easy',
      topic: 'Dynamic Programming',
      tags: ['Math', 'Dynamic Programming', 'Memoization'],
      description: 'You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      examples: [
        { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps' },
        { input: 'n = 3', output: '3', explanation: '1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step' }
      ],
      constraints: ['1 ≤ n ≤ 45'],
      starterCode: {
        'C++': `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your code here\n    }\n};`,
        'Python': `class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass`,
        'JavaScript': `var climbStairs = function(n) {\n    // Write your code here\n};`,
        'Java': `class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}`
      },
      optimalCode: {
        'C++': `class Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; ++i) {\n            int curr = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};`,
        'Python': `class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2: return n\n        a, b = 1, 2\n        for _ in range(3, n + 1):\n            a, b = b, a + b\n        return b`,
        'JavaScript': `var climbStairs = function(n) {\n    if (n <= 2) return n;\n    let a = 1, b = 2;\n    for (let i = 3; i <= n; i++) {\n        const temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n};`,
        'Java': `class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n        return b;\n    }\n}`
      },
      testCases: [
        { id: 1, label: 'Test Case 1', input: 'n = 2', expectedOutput: '2' },
        { id: 2, label: 'Test Case 2', input: 'n = 3', expectedOutput: '3' },
        { id: 3, label: 'Test Case 3', input: 'n = 5', expectedOutput: '8' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      approach: {
        title: 'Fibonacci Space-Optimized DP',
        explanation: 'Ways to reach step n is ways(n-1) + ways(n-2). Only two previous states are required.',
        steps: ['Handle base cases for n=1 and n=2', 'Maintain variables a and b', 'Loop from 3 to n accumulating ways', 'Return final value']
      },
      similarProblems: [
        { title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming' },
        { title: 'House Robber', difficulty: 'Medium', topic: 'Dynamic Programming' }
      ]
    }
  ]
};
