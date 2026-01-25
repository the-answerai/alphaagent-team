#!/usr/bin/env node

/**
 * Pre-Commit Hook: Validate Completion Claims
 *
 * Validates that completion claims match reality:
 * - Test count claims match actual test results
 * - "All tests passing" verified
 * - File modification claims verified
 *
 * This prevents false claims like:
 * - "127/127 tests passing" when actually 120/127
 * - "All tests passing" when tests are failing
 * - "Fixed all console.log" when 0 files modified
 *
 * Usage:
 *   Automatically triggered by Claude Code hooks system when:
 *   - Tool: Bash
 *   - Pattern: "git commit"
 *
 * Validation:
 *   - Runs tests to verify claims
 *   - Compares claimed counts vs actual
 *   - Blocks commits with false claims
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');

/**
 * Detect the project's test command
 */
function detectTestCommand(cwd) {
  const packageJsonPath = path.join(cwd, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Check for test script
    if (packageJson.scripts?.test) {
      // Detect package manager
      if (existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
        return 'pnpm test';
      } else if (existsSync(path.join(cwd, 'yarn.lock'))) {
        return 'yarn test';
      } else if (existsSync(path.join(cwd, 'bun.lockb'))) {
        return 'bun test';
      } else {
        return 'npm test';
      }
    }
  } catch (error) {
    // Ignore parse errors
  }

  return null;
}

/**
 * Validates completion claims in git commit messages
 * @param {Object} context - Hook context
 * @param {string} context.command - The bash command being executed
 * @param {string} context.cwd - Current working directory
 * @returns {Object} - { block: boolean, message?: string }
 */
function validateCompletionClaims(context) {
  const command = context.command || '';
  const cwd = context.cwd || process.cwd();

  if (!command.includes('git commit')) {
    return { block: false };
  }

  const messageMatch = command.match(/-m ["'](.+?)["']/);
  if (!messageMatch) {
    return { block: false };
  }

  const message = messageMatch[1];

  // Check for test count claims (e.g., "127/127 tests passing")
  const testCountMatch = message.match(/(\d+)\/(\d+)\s+tests?\s+passing/i);
  if (testCountMatch) {
    return validateTestCount(testCountMatch[1], testCountMatch[2], cwd);
  }

  // Check for "all tests passing" claim
  if (message.match(/all\s+tests?\s+passing/i)) {
    return validateAllTestsPassing(cwd);
  }

  // Check for file modification claims
  if (message.match(/removed|deleted|fixed|cleaned/i)) {
    return validateFileModifications(message, cwd);
  }

  return { block: false };
}

/**
 * Validates test count claims match actual results
 */
function validateTestCount(claimedPassing, claimedTotal, cwd) {
  const claimed = {
    passing: parseInt(claimedPassing, 10),
    total: parseInt(claimedTotal, 10)
  };

  const testCommand = detectTestCommand(cwd);
  if (!testCommand) {
    console.log('[validate-claims] No test command found, skipping validation');
    return { block: false };
  }

  try {
    const testOutput = execSync(`${testCommand} 2>&1`, {
      encoding: 'utf-8',
      timeout: 60000,
      stdio: 'pipe',
      cwd
    });

    // Try multiple patterns for different test frameworks
    let actual = { passing: 0, failing: 0, total: 0 };

    // Jest/Vitest pattern: "X passed, Y failed"
    const jestPassMatch = testOutput.match(/(\d+)\s+passed/);
    const jestFailMatch = testOutput.match(/(\d+)\s+failed/);

    // Mocha pattern: "X passing", "Y failing"
    const mochaPassMatch = testOutput.match(/(\d+)\s+passing/);
    const mochaFailMatch = testOutput.match(/(\d+)\s+failing/);

    if (jestPassMatch) {
      actual.passing = parseInt(jestPassMatch[1], 10);
      actual.failing = jestFailMatch ? parseInt(jestFailMatch[1], 10) : 0;
    } else if (mochaPassMatch) {
      actual.passing = parseInt(mochaPassMatch[1], 10);
      actual.failing = mochaFailMatch ? parseInt(mochaFailMatch[1], 10) : 0;
    }

    actual.total = actual.passing + actual.failing;

    if (claimed.passing !== actual.passing || claimed.total !== actual.total) {
      return {
        block: true,
        message: `
❌ BLOCKED: Test count mismatch

Commit claims: ${claimed.passing}/${claimed.total} tests passing
Actual results: ${actual.passing}/${actual.total} tests passing

Do NOT commit false claims. Update commit message with actual test results.

Evidence required:
  - Run: ${testCommand}
  - Verify counts match
  - Update commit message
        `
      };
    }

    console.log('[validate-claims] ✓ Test count verified');
    return { block: false };

  } catch (error) {
    return {
      block: true,
      message: `
❌ BLOCKED: Cannot verify test claims

Commit claims test results but tests failed to run.

Error: ${error.message}

Fix tests before committing claims about test results.

Run: ${testCommand}
      `
    };
  }
}

/**
 * Validates "all tests passing" claim
 */
function validateAllTestsPassing(cwd) {
  const testCommand = detectTestCommand(cwd);
  if (!testCommand) {
    console.log('[validate-claims] No test command found, skipping validation');
    return { block: false };
  }

  try {
    const testOutput = execSync(`${testCommand} 2>&1`, {
      encoding: 'utf-8',
      timeout: 60000,
      stdio: 'pipe',
      cwd
    });

    // Check for failures in output
    if (testOutput.match(/(\d+)\s+fail/i)) {
      const failingMatch = testOutput.match(/(\d+)\s+fail/i);
      const failingCount = failingMatch ? failingMatch[1] : 'some';

      return {
        block: true,
        message: `
❌ BLOCKED: False "all tests passing" claim

Commit claims "all tests passing" but ${failingCount} tests are failing.

Run '${testCommand}' to see failures.

Do NOT commit false claims. Either:
1. Fix failing tests
2. Update commit message to reflect reality
        `
      };
    }

    console.log('[validate-claims] ✓ All tests passing verified');
    return { block: false };

  } catch (error) {
    return {
      block: true,
      message: `
❌ BLOCKED: Cannot verify "all tests passing" claim

Tests failed to run.

Error: ${error.message}

Fix tests before claiming "all tests passing".
      `
    };
  }
}

/**
 * Validates file modification claims
 */
function validateFileModifications(message, cwd) {
  try {
    const gitStatus = execSync('git status --short', {
      encoding: 'utf-8',
      timeout: 5000,
      cwd
    });

    const modifiedCount = gitStatus.split('\n').filter(line => line.trim()).length;

    if (modifiedCount === 0) {
      // Extract what was claimed to be modified
      const claimMatch = message.match(/(?:removed|deleted|fixed|cleaned)\s+(.+?)(?:\.|$)/i);
      const claimed = claimMatch ? claimMatch[1] : 'items';

      return {
        block: true,
        message: `
❌ BLOCKED: File modification claim without changes

Commit claims to have modified: ${claimed}

But git status shows 0 files modified.

This is likely agent hallucination.

Evidence required:
  - Run: git status
  - Verify files were actually modified
  - Provide git diff output
        `
      };
    }

    console.log(`[validate-claims] ✓ File modifications verified (${modifiedCount} files)`);
    return { block: false };

  } catch (error) {
    console.error('[validate-claims] Error checking git status:', error.message);
    // Don't block if we can't check - allow commit
    return { block: false };
  }
}

// Export for Claude Code hooks system
module.exports = validateCompletionClaims;

// Allow running directly for testing
if (require.main === module) {
  const testCases = [
    {
      name: 'Should validate test count',
      command: 'git commit -m "All features complete: 127/127 tests passing"',
      expectedValidation: true
    },
    {
      name: 'Should validate "all tests passing"',
      command: 'git commit -m "All tests passing"',
      expectedValidation: true
    },
    {
      name: 'Should check file modifications',
      command: 'git commit -m "Removed all console.log statements"',
      expectedValidation: true
    },
    {
      name: 'Should skip non-claim commits',
      command: 'git commit -m "WIP: working on feature"',
      expectedValidation: false
    }
  ];

  console.log('Testing validate-completion-claims hook...\n');

  testCases.forEach(testCase => {
    console.log(`Testing: ${testCase.name}`);
    console.log(`  Command: ${testCase.command}`);
    console.log(`  Will validate: ${testCase.expectedValidation}`);
    console.log();
  });

  console.log('Note: Actual validation results depend on:');
  console.log('  - Test suite state');
  console.log('  - Git working directory state (git status)');
  console.log('  - Accuracy of claims in commit message');
}
