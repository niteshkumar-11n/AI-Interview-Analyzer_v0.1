/**
 * Code Runner — Client-Side Execution Engine
 *
 * Executes user code against test cases for coding practice problems.
 * - JavaScript: Runs client-side in a sandboxed Function()
 * - Python/C++/Java: Uses Wandbox API (free, no API key)
 * - Shows pass/fail per test case with actual vs expected output
 */

/* ===========================
   Types
   =========================== */
export interface TestCaseResult {
  index: number;
  label: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error: string | null;
  executionTimeMs: number;
}

export interface RunAllResult {
  totalTests: number;
  passed: number;
  failed: number;
  results: TestCaseResult[];
  overallTimeMs: number;
  compilationError: string | null;
}

/* ===========================
   Problem → Test Config Mapping
   Maps each problem ID to the function it defines and concrete test arguments.
   =========================== */
interface TestArg {
  jsCall: string;       // JavaScript: full function call, e.g. "twoSum([2,7,11,15], 9)"
  pyCall: string;       // Python: method call, e.g. "sol.twoSum([2,7,11,15], 9)"
  cppMainBody: string;  // C++: main() body code
  javaMainBody: string; // Java: main() body code
  expected: string;     // Normalized expected output
}

interface ProblemTestConfig {
  funcNameJS: string;
  tests: TestArg[];
}

const PROBLEM_TESTS: Record<string, ProblemTestConfig> = {
  'two-sum': {
    funcNameJS: 'twoSum',
    tests: [
      {
        jsCall: 'twoSum([2,7,11,15], 9)',
        pyCall: 'sol.twoSum([2,7,11,15], 9)',
        cppMainBody: 'vector<int> nums={2,7,11,15}; auto r=sol.twoSum(nums,9); cout<<"["; for(int i=0;i<(int)r.size();i++){if(i)cout<<",";cout<<r[i];} cout<<"]"<<endl;',
        javaMainBody: 'int[] nums={2,7,11,15}; int[] r=sol.twoSum(nums,9); System.out.print("["); for(int i=0;i<r.length;i++){if(i>0)System.out.print(",");System.out.print(r[i]);} System.out.println("]");',
        expected: '[0,1]',
      },
      {
        jsCall: 'twoSum([3,2,4], 6)',
        pyCall: 'sol.twoSum([3,2,4], 6)',
        cppMainBody: 'vector<int> nums={3,2,4}; auto r=sol.twoSum(nums,6); cout<<"["; for(int i=0;i<(int)r.size();i++){if(i)cout<<",";cout<<r[i];} cout<<"]"<<endl;',
        javaMainBody: 'int[] nums={3,2,4}; int[] r=sol.twoSum(nums,6); System.out.print("["); for(int i=0;i<r.length;i++){if(i>0)System.out.print(",");System.out.print(r[i]);} System.out.println("]");',
        expected: '[1,2]',
      },
      {
        jsCall: 'twoSum([3,3], 6)',
        pyCall: 'sol.twoSum([3,3], 6)',
        cppMainBody: 'vector<int> nums={3,3}; auto r=sol.twoSum(nums,6); cout<<"["; for(int i=0;i<(int)r.size();i++){if(i)cout<<",";cout<<r[i];} cout<<"]"<<endl;',
        javaMainBody: 'int[] nums={3,3}; int[] r=sol.twoSum(nums,6); System.out.print("["); for(int i=0;i<r.length;i++){if(i>0)System.out.print(",");System.out.print(r[i]);} System.out.println("]");',
        expected: '[0,1]',
      },
    ],
  },
  'best-time-stock': {
    funcNameJS: 'maxProfit',
    tests: [
      {
        jsCall: 'maxProfit([7,1,5,3,6,4])',
        pyCall: 'sol.maxProfit([7,1,5,3,6,4])',
        cppMainBody: 'vector<int> p={7,1,5,3,6,4}; cout<<sol.maxProfit(p)<<endl;',
        javaMainBody: 'int[] p={7,1,5,3,6,4}; System.out.println(sol.maxProfit(p));',
        expected: '5',
      },
      {
        jsCall: 'maxProfit([7,6,4,3,1])',
        pyCall: 'sol.maxProfit([7,6,4,3,1])',
        cppMainBody: 'vector<int> p={7,6,4,3,1}; cout<<sol.maxProfit(p)<<endl;',
        javaMainBody: 'int[] p={7,6,4,3,1}; System.out.println(sol.maxProfit(p));',
        expected: '0',
      },
      {
        jsCall: 'maxProfit([2,4,1])',
        pyCall: 'sol.maxProfit([2,4,1])',
        cppMainBody: 'vector<int> p={2,4,1}; cout<<sol.maxProfit(p)<<endl;',
        javaMainBody: 'int[] p={2,4,1}; System.out.println(sol.maxProfit(p));',
        expected: '2',
      },
    ],
  },
  'valid-anagram': {
    funcNameJS: 'isAnagram',
    tests: [
      {
        jsCall: 'isAnagram("anagram", "nagaram")',
        pyCall: 'sol.isAnagram("anagram", "nagaram")',
        cppMainBody: 'cout<<(sol.isAnagram("anagram","nagaram")?"true":"false")<<endl;',
        javaMainBody: 'System.out.println(sol.isAnagram("anagram","nagaram"));',
        expected: 'true',
      },
      {
        jsCall: 'isAnagram("rat", "car")',
        pyCall: 'sol.isAnagram("rat", "car")',
        cppMainBody: 'cout<<(sol.isAnagram("rat","car")?"true":"false")<<endl;',
        javaMainBody: 'System.out.println(sol.isAnagram("rat","car"));',
        expected: 'false',
      },
      {
        jsCall: 'isAnagram("a", "ab")',
        pyCall: 'sol.isAnagram("a", "ab")',
        cppMainBody: 'cout<<(sol.isAnagram("a","ab")?"true":"false")<<endl;',
        javaMainBody: 'System.out.println(sol.isAnagram("a","ab"));',
        expected: 'false',
      },
    ],
  },
  'valid-parentheses': {
    funcNameJS: 'isValid',
    tests: [
      {
        jsCall: 'isValid("()")',
        pyCall: 'sol.isValid("()")',
        cppMainBody: 'cout<<(sol.isValid("()")?"true":"false")<<endl;',
        javaMainBody: 'System.out.println(sol.isValid("()"));',
        expected: 'true',
      },
      {
        jsCall: 'isValid("()[]{}")',
        pyCall: 'sol.isValid("()[]{}")',
        cppMainBody: 'cout<<(sol.isValid("()[]{}")?"true":"false")<<endl;',
        javaMainBody: 'System.out.println(sol.isValid("()[]{}"));',
        expected: 'true',
      },
      {
        jsCall: 'isValid("(]")',
        pyCall: 'sol.isValid("(]")',
        cppMainBody: 'cout<<(sol.isValid("(]")?"true":"false")<<endl;',
        javaMainBody: 'System.out.println(sol.isValid("(]"));',
        expected: 'false',
      },
    ],
  },
  'climbing-stairs': {
    funcNameJS: 'climbStairs',
    tests: [
      {
        jsCall: 'climbStairs(2)',
        pyCall: 'sol.climbStairs(2)',
        cppMainBody: 'cout<<sol.climbStairs(2)<<endl;',
        javaMainBody: 'System.out.println(sol.climbStairs(2));',
        expected: '2',
      },
      {
        jsCall: 'climbStairs(3)',
        pyCall: 'sol.climbStairs(3)',
        cppMainBody: 'cout<<sol.climbStairs(3)<<endl;',
        javaMainBody: 'System.out.println(sol.climbStairs(3));',
        expected: '3',
      },
      {
        jsCall: 'climbStairs(5)',
        pyCall: 'sol.climbStairs(5)',
        cppMainBody: 'cout<<sol.climbStairs(5)<<endl;',
        javaMainBody: 'System.out.println(sol.climbStairs(5));',
        expected: '8',
      },
    ],
  },
  'number-of-islands': {
    funcNameJS: 'numIslands',
    tests: [
      {
        jsCall: 'numIslands([["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]])',
        pyCall: 'sol.numIslands([["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]])',
        cppMainBody: 'vector<vector<char>> g={{"1","1","1","1","0"},{"1","1","0","1","0"},{"1","1","0","0","0"},{"0","0","0","0","0"}}; cout<<sol.numIslands(g)<<endl;',
        javaMainBody: 'char[][] g={{"1","1","1","1","0"},{"1","1","0","1","0"},{"1","1","0","0","0"},{"0","0","0","0","0"}}; System.out.println(sol.numIslands(g));',
        expected: '1',
      },
      {
        jsCall: 'numIslands([["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]])',
        pyCall: 'sol.numIslands([["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]])',
        cppMainBody: 'vector<vector<char>> g={{"1","1","0","0","0"},{"1","1","0","0","0"},{"0","0","1","0","0"},{"0","0","0","1","1"}}; cout<<sol.numIslands(g)<<endl;',
        javaMainBody: 'char[][] g={{"1","1","0","0","0"},{"1","1","0","0","0"},{"0","0","1","0","0"},{"0","0","0","1","1"}}; System.out.println(sol.numIslands(g));',
        expected: '3',
      },
      {
        jsCall: 'numIslands([["0"]])',
        pyCall: 'sol.numIslands([["0"]])',
        cppMainBody: 'vector<vector<char>> g={{"0"}}; cout<<sol.numIslands(g)<<endl;',
        javaMainBody: 'char[][] g={{"0"}}; System.out.println(sol.numIslands(g));',
        expected: '0',
      },
    ],
  },
  'reverse-linked-list': {
    funcNameJS: 'reverseList',
    tests: [
      {
        jsCall: '__testLinkedList([1,2,3,4,5])',
        pyCall: '__test_linked_list([1,2,3,4,5])',
        cppMainBody: '// Linked list problem — manual test',
        javaMainBody: '// Linked list problem — manual test',
        expected: '[5,4,3,2,1]',
      },
      {
        jsCall: '__testLinkedList([1,2])',
        pyCall: '__test_linked_list([1,2])',
        cppMainBody: '',
        javaMainBody: '',
        expected: '[2,1]',
      },
      {
        jsCall: '__testLinkedList([])',
        pyCall: '__test_linked_list([])',
        cppMainBody: '',
        javaMainBody: '',
        expected: '[]',
      },
    ],
  },
  'invert-binary-tree': {
    funcNameJS: 'invertTree',
    tests: [
      {
        jsCall: '__testInvertTree([4,2,7,1,3,6,9])',
        pyCall: '__test_invert_tree([4,2,7,1,3,6,9])',
        cppMainBody: '',
        javaMainBody: '',
        expected: '[4,7,2,9,6,3,1]',
      },
      {
        jsCall: '__testInvertTree([2,1,3])',
        pyCall: '__test_invert_tree([2,1,3])',
        cppMainBody: '',
        javaMainBody: '',
        expected: '[2,3,1]',
      },
      {
        jsCall: '__testInvertTree([])',
        pyCall: '__test_invert_tree([])',
        cppMainBody: '',
        javaMainBody: '',
        expected: '[]',
      },
    ],
  },
  'queue-using-stacks': {
    funcNameJS: 'MyQueue',
    tests: [
      {
        jsCall: '__testQueue()',
        pyCall: '__test_queue()',
        cppMainBody: '',
        javaMainBody: '',
        expected: '1',
      },
      {
        jsCall: '__testQueue2()',
        pyCall: '__test_queue2()',
        cppMainBody: '',
        javaMainBody: '',
        expected: '1',
      },
      {
        jsCall: '__testQueue3()',
        pyCall: '__test_queue3()',
        cppMainBody: '',
        javaMainBody: '',
        expected: 'false',
      },
    ],
  },
};

/* ===========================
   Wandbox API Config (free public code executor — no API key required)
   =========================== */
const WANDBOX_API_URL = 'https://wandbox.org/api/compile.json';

const WANDBOX_COMPILER_MAP: Record<string, { compiler: string; filename: string }> = {
  'Python': { compiler: 'cpython-3.12.7', filename: 'prog.py' },
  'JavaScript': { compiler: 'nodejs-20.17.0', filename: 'prog.js' },
  'C++': { compiler: 'gcc-13.2.0', filename: 'prog.cc' },
  'Java': { compiler: 'openjdk-jdk-22+36', filename: 'prog.java' },
};

/* ===========================
   Output Normalization
   =========================== */
function normalizeOutput(output: string): string {
  let s = output.trim();
  // Remove trailing newlines
  s = s.replace(/\n+$/g, '');
  // Take only the last line (in case there's debug output)
  const lines = s.split('\n');
  s = lines[lines.length - 1].trim();
  // Python booleans
  s = s.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
  // Normalize whitespace around brackets/commas
  s = s.replace(/\[\s+/g, '[').replace(/\s+\]/g, ']').replace(/,\s+/g, ',');
  // Remove outer quotes if present
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1);
  }
  return s;
}

/* ===========================
   JavaScript Client-Side Execution
   =========================== */
function executeJavaScriptInSandbox(code: string): { stdout: string; stderr: string } {
  const logs: string[] = [];
  const errors: string[] = [];

  const fakeConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map(a => {
        if (a === null) return 'null';
        if (a === undefined) return 'undefined';
        if (typeof a === 'object') return JSON.stringify(a);
        return String(a);
      }).join(' '));
    },
    error: (...args: unknown[]) => {
      errors.push(args.map(a => String(a)).join(' '));
    },
    warn: (...args: unknown[]) => {
      logs.push(args.map(a => String(a)).join(' '));
    },
    info: (...args: unknown[]) => {
      logs.push(args.map(a => String(a)).join(' '));
    },
  };

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('console', 'require', 'process', 'global', code);
    fn(fakeConsole, () => { throw new Error('require() is not available'); }, {}, {});
    return { stdout: logs.join('\n'), stderr: errors.join('\n') };
  } catch (e: any) {
    return { stdout: logs.join('\n'), stderr: e.message || String(e) };
  }
}

/* ===========================
   JavaScript — Build Test Wrapper
   =========================== */
function buildJSTestCode(userCode: string, problemId: string, testIndex: number): string {
  const config = PROBLEM_TESTS[problemId];
  if (!config || !config.tests[testIndex]) return userCode;

  const test = config.tests[testIndex];

  // Special wrappers for data-structure problems
  if (problemId === 'reverse-linked-list') {
    return `
${userCode}

function __ListNode(val, next) { this.val = val === undefined ? 0 : val; this.next = next === undefined ? null : next; }
function __arrayToList(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) head = new __ListNode(arr[i], head);
  return head;
}
function __listToArray(head) {
  const r = []; let n = head;
  while (n) { r.push(n.val); n = n.next; }
  return r;
}
function __testLinkedList(arr) {
  const head = __arrayToList(arr);
  const result = reverseList(head);
  return __listToArray(result);
}

const __r = ${test.jsCall};
console.log(JSON.stringify(__r));
`;
  }

  if (problemId === 'invert-binary-tree') {
    return `
${userCode}

function __TreeNode(val, left, right) { this.val = val === undefined ? 0 : val; this.left = left === undefined ? null : left; this.right = right === undefined ? null : right; }
function __arrayToTree(arr) {
  if (!arr.length) return null;
  const root = new __TreeNode(arr[0]);
  const queue = [root]; let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new __TreeNode(arr[i]); queue.push(node.left); } i++;
    if (i < arr.length && arr[i] !== null) { node.right = new __TreeNode(arr[i]); queue.push(node.right); } i++;
  }
  return root;
}
function __treeToArray(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}
function __testInvertTree(arr) {
  const root = __arrayToTree(arr);
  const result = invertTree(root);
  return __treeToArray(result);
}

const __r = ${test.jsCall};
console.log(JSON.stringify(__r));
`;
  }

  if (problemId === 'queue-using-stacks') {
    return `
${userCode}

function __testQueue() {
  const q = new MyQueue();
  q.push(1); q.push(2);
  return q.peek();
}
function __testQueue2() {
  const q = new MyQueue();
  q.push(1); q.push(2);
  return q.pop();
}
function __testQueue3() {
  const q = new MyQueue();
  q.push(1); q.push(2);
  q.pop();
  q.pop();
  return q.empty();
}

const __r = ${test.jsCall};
console.log(typeof __r === 'boolean' ? (__r ? 'true' : 'false') : JSON.stringify(__r));
`;
  }

  // Generic test wrapper for simple function-based problems
  return `
${userCode}

const __result = ${test.jsCall};
if (typeof __result === 'boolean') {
  console.log(__result ? 'true' : 'false');
} else if (typeof __result === 'object' && __result !== null) {
  console.log(JSON.stringify(__result));
} else {
  console.log(String(__result));
}
`;
}

/* ===========================
   Python — Build Test Wrapper
   =========================== */
function buildPythonTestCode(userCode: string, problemId: string, testIndex: number): string {
  const config = PROBLEM_TESTS[problemId];
  if (!config || !config.tests[testIndex]) return userCode;

  const test = config.tests[testIndex];

  if (problemId === 'reverse-linked-list') {
    return `
from typing import List, Optional
import collections

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def __array_to_list(arr):
    head = None
    for v in reversed(arr):
        head = ListNode(v, head)
    return head

def __list_to_array(head):
    r = []
    while head:
        r.append(head.val)
        head = head.next
    return r

def __test_linked_list(arr):
    head = __array_to_list(arr)
    ${userCode.includes('class Solution') ? `
sol = Solution()
result = sol.reverseList(head)
` : `result = reverseList(head)`}
    return __list_to_array(result)

${userCode}

r = ${test.pyCall}
print(r)
`;
  }

  if (problemId === 'invert-binary-tree') {
    return `
from typing import List, Optional
import collections

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def __array_to_tree(arr):
    if not arr: return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        node = queue.pop(0)
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def __tree_to_array(root):
    if not root: return []
    result = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        result.append(node.val)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)
    return result

def __test_invert_tree(arr):
    root = __array_to_tree(arr)
    sol = Solution()
    result = sol.invertTree(root)
    return __tree_to_array(result)

${userCode}

r = ${test.pyCall}
print(r)
`;
  }

  if (problemId === 'queue-using-stacks') {
    return `
from typing import List, Optional

${userCode}

def __test_queue():
    q = MyQueue()
    q.push(1)
    q.push(2)
    return q.peek()

def __test_queue2():
    q = MyQueue()
    q.push(1)
    q.push(2)
    return q.pop()

def __test_queue3():
    q = MyQueue()
    q.push(1)
    q.push(2)
    q.pop()
    q.pop()
    return q.empty()

r = ${test.pyCall}
if isinstance(r, bool):
    print('true' if r else 'false')
else:
    print(r)
`;
  }

  // Generic Python wrapper
  return `
from typing import List, Optional, Dict, Tuple
import collections
import math
import sys

${userCode}

sol = Solution()
__result = ${test.pyCall}
if isinstance(__result, bool):
    print('true' if __result else 'false')
elif isinstance(__result, list):
    print(__result)
else:
    print(__result)
`;
}

/* ===========================
   C++ — Build Test Wrapper
   =========================== */
function buildCppTestCode(userCode: string, problemId: string, testIndex: number): string {
  const config = PROBLEM_TESTS[problemId];
  if (!config || !config.tests[testIndex]) return userCode;
  const test = config.tests[testIndex];
  if (!test.cppMainBody) return '';

  return `#include <bits/stdc++.h>
using namespace std;

${userCode}

int main() {
    Solution sol;
    ${test.cppMainBody}
    return 0;
}
`;
}

/* ===========================
   Java — Build Test Wrapper
   =========================== */
function buildJavaTestCode(userCode: string, problemId: string, testIndex: number): string {
  const config = PROBLEM_TESTS[problemId];
  if (!config || !config.tests[testIndex]) return userCode;
  const test = config.tests[testIndex];
  if (!test.javaMainBody) return '';

  return `import java.util.*;

${userCode}

class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        ${test.javaMainBody}
    }
}
`;
}

/* ===========================
   Wandbox API Execution
   =========================== */
async function executeViaWandbox(
  code: string,
  language: string
): Promise<{ stdout: string; stderr: string; error: string | null }> {
  const compilerConfig = WANDBOX_COMPILER_MAP[language];
  if (!compilerConfig) return { stdout: '', stderr: '', error: `Language "${language}" not supported by Wandbox` };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    // For Java, Wandbox requires the class name to match the filename.
    // The default template expects "prog.java" with a class named "prog" or a public class matching.
    // We'll use the code as-is since our test builders already wrap code in a Main class.
    const res = await fetch(WANDBOX_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        compiler: compilerConfig.compiler,
        code: code,
        save: false,
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return { stdout: '', stderr: '', error: `Wandbox API error: ${res.status}` };
    }

    const data = await res.json();

    // Wandbox response fields:
    // - program_output: stdout from the executed program
    // - program_error: stderr from the executed program
    // - compiler_error: compilation errors (for compiled languages)
    // - compiler_message: compiler warnings/info
    // - status: exit code ("0" for success)
    const compileErr = (data.compiler_error || '').trim();
    const programOutput = (data.program_output || '').trim();
    const programError = (data.program_error || '').trim();

    if (compileErr) {
      return { stdout: '', stderr: compileErr, error: 'Compilation Error' };
    }

    return { stdout: programOutput, stderr: programError, error: programError ? 'Runtime Error' : null };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { stdout: '', stderr: '', error: 'Execution timed out (30s)' };
    }
    return { stdout: '', stderr: '', error: `Network error: ${err.message}` };
  }
}

/* ===========================
   Execute a Single Test Case
   =========================== */
async function executeSingleTest(
  userCode: string,
  problemId: string,
  testIndex: number,
  language: string,
  testLabel: string,
  testInput: string
): Promise<TestCaseResult> {
  const config = PROBLEM_TESTS[problemId];
  if (!config || !config.tests[testIndex]) {
    return {
      index: testIndex, label: testLabel, passed: false,
      input: testInput, expectedOutput: 'N/A', actualOutput: '',
      error: 'No test configuration for this problem', executionTimeMs: 0,
    };
  }

  const test = config.tests[testIndex];
  const startTime = performance.now();

  let stdout = '';
  let stderr = '';
  let error: string | null = null;

  if (language === 'JavaScript') {
    // Client-side execution
    const wrappedCode = buildJSTestCode(userCode, problemId, testIndex);
    const result = executeJavaScriptInSandbox(wrappedCode);
    stdout = result.stdout;
    stderr = result.stderr;
    if (stderr) error = 'Runtime Error';
  } else if (language === 'Python') {
    const wrappedCode = buildPythonTestCode(userCode, problemId, testIndex);
    const result = await executeViaWandbox(wrappedCode, 'Python');
    stdout = result.stdout;
    stderr = result.stderr;
    error = result.error;
  } else if (language === 'C++') {
    const wrappedCode = buildCppTestCode(userCode, problemId, testIndex);
    if (!wrappedCode) {
      return {
        index: testIndex, label: testLabel, passed: false,
        input: testInput, expectedOutput: test.expected, actualOutput: '',
        error: 'C++ auto-testing not available for this problem type. Use JavaScript or Python.',
        executionTimeMs: 0,
      };
    }
    const result = await executeViaWandbox(wrappedCode, 'C++');
    stdout = result.stdout;
    stderr = result.stderr;
    error = result.error;
  } else if (language === 'Java') {
    const wrappedCode = buildJavaTestCode(userCode, problemId, testIndex);
    if (!wrappedCode) {
      return {
        index: testIndex, label: testLabel, passed: false,
        input: testInput, expectedOutput: test.expected, actualOutput: '',
        error: 'Java auto-testing not available for this problem type. Use JavaScript or Python.',
        executionTimeMs: 0,
      };
    }
    const result = await executeViaWandbox(wrappedCode, 'Java');
    stdout = result.stdout;
    stderr = result.stderr;
    error = result.error;
  }

  const executionTimeMs = Math.round(performance.now() - startTime);
  const normalizedActual = normalizeOutput(stdout);
  const normalizedExpected = normalizeOutput(test.expected);
  const passed = !error && !stderr && normalizedActual === normalizedExpected;

  return {
    index: testIndex,
    label: testLabel,
    passed,
    input: testInput,
    expectedOutput: test.expected,
    actualOutput: stdout || stderr || (error || 'No output'),
    error: error || (stderr ? stderr : null),
    executionTimeMs,
  };
}

/* ===========================
   Main Entry: Run All Test Cases
   =========================== */
export async function runAllTests(
  userCode: string,
  problemId: string,
  language: string,
  testCases: { id: number; label: string; input: string; expectedOutput: string }[]
): Promise<RunAllResult> {
  const overallStart = performance.now();
  const results: TestCaseResult[] = [];
  let compilationError: string | null = null;

  const config = PROBLEM_TESTS[problemId];
  if (!config) {
    return {
      totalTests: testCases.length,
      passed: 0,
      failed: testCases.length,
      results: testCases.map((tc, i) => ({
        index: i, label: tc.label, passed: false,
        input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: '',
        error: 'No test configuration available for this problem.', executionTimeMs: 0,
      })),
      overallTimeMs: 0,
      compilationError: 'Test configuration not found for this problem.',
    };
  }

  for (let i = 0; i < Math.min(testCases.length, config.tests.length); i++) {
    const tc = testCases[i];
    const result = await executeSingleTest(userCode, problemId, i, language, tc.label, tc.input);
    results.push(result);

    // If compilation error, skip remaining tests
    if (result.error === 'Compilation Error') {
      compilationError = result.actualOutput || result.error;
      for (let j = i + 1; j < Math.min(testCases.length, config.tests.length); j++) {
        results.push({
          index: j, label: testCases[j].label, passed: false,
          input: testCases[j].input, expectedOutput: config.tests[j].expected,
          actualOutput: '', error: 'Skipped (compilation error)', executionTimeMs: 0,
        });
      }
      break;
    }
  }

  const passed = results.filter(r => r.passed).length;
  const overallTimeMs = Math.round(performance.now() - overallStart);

  return {
    totalTests: results.length,
    passed,
    failed: results.length - passed,
    results,
    overallTimeMs,
    compilationError,
  };
}

/** Check if a problem supports auto-testing */
export function canAutoTest(problemId: string): boolean {
  return problemId in PROBLEM_TESTS;
}
