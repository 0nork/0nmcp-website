import type { RuntimeType } from '@/components/terminal/OnTerminalTypes'

const SHELL_CMDS = new Set([
  'ls', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'echo', 'pwd',
  'cd', 'clear', 'help', 'env', 'export', 'which', 'whoami',
  '0nmcp', 'exit',
])

const JS_PATTERNS = [
  /^(const|let|var|function|class|import|export|async|await)\s/,
  /^console\./,
  /=>\s*\{/,
  /\.(then|catch|finally)\(/,
  /^require\(/,
  /^\/\//,
]

const PY_PATTERNS = [
  /^(def|class|import|from|print|if|elif|else|for|while|try|except|with|raise|return)\s/,
  /^print\(/,
  /^\s*#/,
  /:\s*$/,
  /^f['"]/,
]

export function detectRuntime(input: string, nodeReady: boolean): Exclude<RuntimeType, 'auto'> {
  if (/^(npm|npx|node)\s/.test(input)) return 'node'
  if (/^python\s/.test(input)) return 'python'
  if (/^(pip|micropip)\s/.test(input)) return 'python'

  const firstWord = input.split(/\s/)[0]
  if (SHELL_CMDS.has(firstWord)) return 'shell'

  if (JS_PATTERNS.some(p => p.test(input))) return 'node'
  if (PY_PATTERNS.some(p => p.test(input))) return 'python'

  return nodeReady ? 'node' : 'shell'
}
