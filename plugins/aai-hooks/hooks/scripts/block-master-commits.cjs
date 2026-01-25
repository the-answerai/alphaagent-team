#!/usr/bin/env node
/**
 * Block Master/Main Branch Commits Hook
 *
 * Prevents direct commits to protected branches (main, master, production, develop).
 * Only allows commits on feature branches.
 *
 * Usage:
 *   Automatically triggered by Claude Code hooks system when:
 *   - Event: PreToolUse
 *   - Matcher: Bash
 *   - Pattern: "git commit" | "git push" | "git merge"
 *
 * Exit codes:
 *   0 - Allow (on feature branch)
 *   2 - Block (on protected branch) - exit code 2 blocks and provides feedback
 */

const { execSync } = require('child_process');

// Protected branch patterns - configurable via environment
const PROTECTED_BRANCHES = (process.env.PROTECTED_BRANCHES || 'main,master,production,develop')
  .split(',')
  .map(b => b.trim().toLowerCase());

/**
 * Get current git branch name
 */
function getCurrentBranch(cwd) {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Check if branch is protected
 */
function isProtectedBranch(branchName) {
  if (!branchName) return false;
  const lowerBranch = branchName.toLowerCase();
  return PROTECTED_BRANCHES.some(
    (protected) => lowerBranch === protected || lowerBranch === `origin/${protected}`
  );
}

/**
 * Read stdin for hook context
 */
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    setTimeout(() => resolve(data), 100);
  });
}

/**
 * Main hook function
 */
async function main() {
  const stdinData = await readStdin();
  let context = {};

  if (stdinData.trim()) {
    try {
      context = JSON.parse(stdinData);
    } catch {
      // Use default context
    }
  }

  const command = context?.tool_input?.command || '';
  const cwd = context?.cwd || process.cwd();

  // Only check git commands
  if (!command.match(/git\s+(commit|push|merge)/)) {
    process.exit(0);
  }

  // Get current branch
  const currentBranch = getCurrentBranch(cwd);

  if (!currentBranch) {
    // Can't determine branch - allow but warn
    console.error('[block-master] Warning: Could not determine current branch');
    process.exit(0);
  }

  // Check if on protected branch
  if (isProtectedBranch(currentBranch)) {
    const message = `
⛔ BLOCKED: Cannot operate directly on '${currentBranch}'

This is a protected branch. Direct commits/pushes/merges are not allowed.

REQUIRED: Create a feature branch first:

  git checkout -b feature/your-feature-name
  # or
  git checkout -b fix/your-fix-name

Then make your changes on the feature branch.

Protected branches: ${PROTECTED_BRANCHES.join(', ')}
`;

    console.error(message);
    // Exit code 2 blocks the operation and sends feedback to Claude
    process.exit(2);
  }

  // On feature branch - allow
  process.exit(0);
}

main();
