#!/usr/bin/env node

/**
 * Pre-Commit Hook: Require Verification
 *
 * Blocks git commits that claim completion without verification evidence.
 *
 * This prevents "Optimism Debt" where agents claim tasks are complete
 * without providing proof (git diff, build status, test results).
 *
 * Usage:
 *   Automatically triggered by Claude Code hooks system when:
 *   - Tool: Bash
 *   - Pattern: "git commit"
 *
 * Validation:
 *   - Detects completion keywords in commit message
 *   - Requires task-completion-evidence.md OR passes basic checks
 *   - Validates evidence file contains required sections
 *
 * Note: This hook can be bypassed by including "[skip-verify]" in commit message
 * for WIP commits or other legitimate cases.
 */

const { existsSync, readFileSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * Validates git commit command for verification requirements
 * @param {Object} context - Hook context
 * @param {string} context.command - The bash command being executed
 * @param {string} context.cwd - Current working directory
 * @returns {Object} - { block: boolean, message?: string }
 */
function requireVerification(context) {
  const command = context.command || '';
  const cwd = context.cwd || process.cwd();

  // Only check git commit commands
  if (!command.includes('git commit')) {
    return { block: false };
  }

  // Extract commit message
  const messageMatch = command.match(/-m ["'](.+?)["']/);
  if (!messageMatch) {
    // No -m flag, likely interactive commit - allow
    return { block: false };
  }

  const message = messageMatch[1];

  // Allow bypass with [skip-verify]
  if (message.includes('[skip-verify]')) {
    console.log('[require-verification] Skipping due to [skip-verify] flag');
    return { block: false };
  }

  // Check for completion claims (using word boundaries to avoid false positives)
  const completionKeywords = [
    'complete', 'completed', 'done', 'finished', 'implemented',
    'added', 'created', 'fixed', 'updated',
    'implement', 'finish'
  ];

  // Use word boundaries on both sides to match whole words only
  const hasCompletionClaim = completionKeywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(message);
  });

  if (!hasCompletionClaim) {
    // No completion claim - allow commit
    return { block: false };
  }

  // Completion claim detected - check for evidence
  const evidenceFile = path.join(cwd, 'task-completion-evidence.md');
  const hasEvidenceFile = existsSync(evidenceFile);

  // If evidence file exists, validate it
  if (hasEvidenceFile) {
    const evidence = readFileSync(evidenceFile, 'utf-8');

    const requiredSections = [
      'Files Modified',
      'Changes Summary',
      'Build Status',
      'Test Status'
    ];

    const missingSections = requiredSections.filter(section =>
      !evidence.includes(section)
    );

    if (missingSections.length > 0) {
      return {
        block: true,
        message: `
❌ BLOCKED: Incomplete verification evidence

Evidence file exists but missing sections:
${missingSections.map(s => `  - ${s}`).join('\n')}

Either:
1. Update task-completion-evidence.md with missing sections
2. Add [skip-verify] to commit message for WIP commits
        `
      };
    }

    // Evidence complete - allow commit
    console.log('[require-verification] ✓ Verification evidence found');
    return { block: false };
  }

  // No evidence file - do basic verification
  const basicCheck = performBasicVerification(cwd);

  if (!basicCheck.passed) {
    return {
      block: true,
      message: `
❌ BLOCKED: Completion claim without verification

Commit message: "${message}"

This message contains a completion claim but verification failed:
${basicCheck.reason}

Options:
1. Run tests and ensure they pass
2. Create task-completion-evidence.md with:
   - Files Modified
   - Changes Summary
   - Build Status
   - Test Status
3. Add [skip-verify] to commit message for WIP commits

CRITICAL: Do NOT claim completion without verification.
This prevents "Optimism Debt" where agents claim completion without proof.
      `
    };
  }

  console.log('[require-verification] ✓ Basic verification passed');
  return { block: false };
}

/**
 * Perform basic verification checks
 */
function performBasicVerification(cwd) {
  // Check 1: Are there actually staged changes?
  try {
    const stagedFiles = execSync('git diff --cached --name-only', {
      cwd,
      encoding: 'utf-8',
      timeout: 5000
    }).trim();

    if (!stagedFiles) {
      return {
        passed: false,
        reason: 'No files staged for commit'
      };
    }
  } catch (error) {
    return {
      passed: false,
      reason: 'Failed to check staged files: ' + error.message
    };
  }

  // Check 2: Does TypeScript compile (if applicable)?
  const tsconfigPath = path.join(cwd, 'tsconfig.json');
  if (existsSync(tsconfigPath)) {
    try {
      execSync('npx tsc --noEmit 2>&1', {
        cwd,
        encoding: 'utf-8',
        timeout: 30000,
        stdio: 'pipe'
      });
    } catch (error) {
      const output = error.stdout || error.message;
      if (output.includes('error TS')) {
        return {
          passed: false,
          reason: 'TypeScript compilation errors exist'
        };
      }
    }
  }

  return { passed: true };
}

// Export for Claude Code hooks system
module.exports = requireVerification;

// Allow running directly for testing
if (require.main === module) {
  const testCases = [
    {
      name: 'Should block: completion claim without evidence',
      command: 'git commit -m "Implemented feature X"',
      expectedBlock: true
    },
    {
      name: 'Should allow: no completion keywords',
      command: 'git commit -m "WIP: working on feature"',
      expectedBlock: false
    },
    {
      name: 'Should allow: skip-verify flag',
      command: 'git commit -m "Added feature [skip-verify]"',
      expectedBlock: false
    },
    {
      name: 'Should allow: non-commit command',
      command: 'git status',
      expectedBlock: false
    }
  ];

  console.log('Testing require-verification hook...\n');

  testCases.forEach(testCase => {
    const result = requireVerification({ command: testCase.command, cwd: process.cwd() });
    const passed = result.block === testCase.expectedBlock;

    console.log(`${passed ? '✓' : '✗'} ${testCase.name}`);
    console.log(`  Command: ${testCase.command}`);
    console.log(`  Expected block: ${testCase.expectedBlock}, Got: ${result.block}`);
    if (result.message) {
      console.log(`  Message: ${result.message.substring(0, 80)}...`);
    }
    console.log();
  });
}
