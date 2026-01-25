#!/usr/bin/env node

/**
 * SubagentStop Hook: Validate Anti-Patterns
 *
 * Lightweight validation that runs after every subagent completes.
 * Checks for common anti-patterns WITHOUT running tests (fast).
 *
 * Validates:
 * 1. No backup/temp test files committed (*.bak, *.fixmock, etc.)
 * 2. No console.log in production code (configurable)
 * 3. No staged backup files
 *
 * Usage:
 *   Automatically triggered by Claude Code hooks system when:
 *   - Event: SubagentStop
 *
 * This prevents anti-patterns from being introduced during agent work.
 */

const { execSync } = require('child_process');
const { existsSync, readdirSync } = require('fs');
const path = require('path');

// Patterns for backup/temp files that should NEVER be committed
const BACKUP_FILE_PATTERNS = [
  /\.bak\d*$/,
  /\.fixmock$/,
  /\.final$/,
  /\.prefinal$/,
  /\.broken$/,
  /\.backup$/,
  /\.new$/,
  /\.old$/,
  /\.orig$/,
  /\.tmp$/
];

// Default directories to check (can be customized per project)
const DEFAULT_CHECK_DIRS = ['src', 'lib', 'app'];

// Excluded patterns for console.log check (legitimate uses)
const CONSOLE_LOG_EXCLUSIONS = [
  'logger.ts',
  'logger.js',
  'logging.ts',
  'logging.js',
  '.test.ts',
  '.test.js',
  '.spec.ts',
  '.spec.js',
  '__tests__/',
  '__mocks__/',
  '.md',
  'node_modules/'
];

/**
 * Main validation function
 */
function validateAntiPatterns(context) {
  const issues = [];
  const warnings = [];
  const cwd = context?.cwd || process.cwd();

  console.log('[anti-patterns] Running anti-pattern validation...');

  // 1. Check for backup/temp files
  const backupFiles = findBackupFiles(cwd);
  if (backupFiles.length > 0) {
    issues.push({
      type: 'BACKUP_FILES',
      severity: 'error',
      message: `Found ${backupFiles.length} backup/temp files that should be deleted`,
      files: backupFiles.slice(0, 10),
      fix: 'Delete these files: rm ' + backupFiles.slice(0, 5).join(' ')
    });
  }

  // 2. Check for console.log in production code (warning only)
  const consoleLogFiles = findConsoleLogViolations(cwd);
  if (consoleLogFiles.length > 0) {
    warnings.push({
      type: 'CONSOLE_LOG',
      severity: 'warning',
      message: `Found console.log in ${consoleLogFiles.length} production files`,
      files: consoleLogFiles.slice(0, 10),
      fix: 'Consider using a structured logger instead'
    });
  }

  // 3. Check for staged backup files (about to be committed)
  const stagedBackupFiles = findStagedBackupFiles(cwd);
  if (stagedBackupFiles.length > 0) {
    issues.push({
      type: 'STAGED_BACKUP_FILES',
      severity: 'error',
      message: `${stagedBackupFiles.length} backup files are staged for commit`,
      files: stagedBackupFiles,
      fix: 'Unstage and delete: git reset HEAD -- ' + stagedBackupFiles.join(' ')
    });
  }

  // Generate report
  const report = generateReport(issues, warnings);

  // Determine if we should block
  const hasErrors = issues.length > 0;

  if (hasErrors) {
    console.log('[anti-patterns] ❌ Validation FAILED');
    return {
      block: true,
      message: report
    };
  } else if (warnings.length > 0) {
    console.log(`[anti-patterns] ⚠️  ${warnings.length} warnings (not blocking)`);
    // Don't block on warnings, but log them
    console.log(report);
    return { block: false };
  } else {
    console.log('[anti-patterns] ✓ All checks passed');
    return { block: false };
  }
}

/**
 * Find backup/temp files in the codebase
 */
function findBackupFiles(cwd) {
  const backupFiles = [];

  try {
    // Check common directories for backup files
    const dirsToCheck = [...DEFAULT_CHECK_DIRS, 'tests', '.claude'];

    for (const dir of dirsToCheck) {
      const fullPath = path.join(cwd, dir);
      if (existsSync(fullPath)) {
        const files = findFilesRecursive(fullPath, file =>
          BACKUP_FILE_PATTERNS.some(pattern => pattern.test(file))
        );
        backupFiles.push(...files.map(f => path.relative(cwd, f)));
      }
    }
  } catch (error) {
    console.error('[anti-patterns] Error finding backup files:', error.message);
  }

  return backupFiles;
}

/**
 * Find console.log violations in production code
 */
function findConsoleLogViolations(cwd) {
  const violations = [];

  // Only check if src/ exists
  const srcDir = path.join(cwd, 'src');
  if (!existsSync(srcDir)) {
    return violations;
  }

  try {
    // Use grep to find console.log in src/ (fast)
    const result = execSync(
      'grep -rn "console\\.log" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true',
      { cwd, encoding: 'utf-8', maxBuffer: 1024 * 1024 }
    );

    const lines = result.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const [filePath] = line.split(':');
      if (filePath && !isExcluded(filePath, CONSOLE_LOG_EXCLUSIONS)) {
        if (!violations.includes(filePath)) {
          violations.push(filePath);
        }
      }
    }
  } catch (error) {
    // Grep might fail if no matches - that's OK
  }

  return violations;
}

/**
 * Find backup files that are staged for commit
 */
function findStagedBackupFiles(cwd) {
  const stagedBackups = [];

  try {
    const result = execSync('git diff --cached --name-only 2>/dev/null || true', {
      cwd,
      encoding: 'utf-8'
    });

    const stagedFiles = result.split('\n').filter(f => f.trim());

    for (const file of stagedFiles) {
      if (BACKUP_FILE_PATTERNS.some(pattern => pattern.test(file))) {
        stagedBackups.push(file);
      }
    }
  } catch (error) {
    // Git might not be available
  }

  return stagedBackups;
}

/**
 * Recursively find files matching a predicate
 */
function findFilesRecursive(dir, predicate, files = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'coverage' && entry.name !== '.git') {
          findFilesRecursive(fullPath, predicate, files);
        }
      } else if (entry.isFile() && predicate(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not be readable
  }

  return files;
}

/**
 * Check if a file path is excluded
 */
function isExcluded(filePath, exclusions) {
  return exclusions.some(excl => filePath.includes(excl));
}

/**
 * Generate a formatted report
 */
function generateReport(issues, warnings) {
  const lines = [];

  lines.push('\n' + '='.repeat(60));
  lines.push('ANTI-PATTERN VALIDATION REPORT');
  lines.push('='.repeat(60));

  if (issues.length > 0) {
    lines.push('\n❌ ERRORS (must fix before proceeding):');
    lines.push('-'.repeat(40));

    for (const issue of issues) {
      lines.push(`\n[${issue.type}] ${issue.message}`);
      if (issue.files && issue.files.length > 0) {
        lines.push('  Files:');
        for (const file of issue.files) {
          lines.push(`    - ${file}`);
        }
        if (issue.files.length === 10) {
          lines.push('    ... (showing first 10)');
        }
      }
      if (issue.fix) {
        lines.push(`  Fix: ${issue.fix}`);
      }
    }
  }

  if (warnings.length > 0) {
    lines.push('\n⚠️  WARNINGS (should fix when possible):');
    lines.push('-'.repeat(40));

    for (const warning of warnings) {
      lines.push(`\n[${warning.type}] ${warning.message}`);
      if (warning.files && warning.files.length > 0) {
        lines.push('  Files:');
        for (const file of warning.files.slice(0, 5)) {
          lines.push(`    - ${file}`);
        }
        if (warning.files.length > 5) {
          lines.push(`    ... and ${warning.files.length - 5} more`);
        }
      }
      if (warning.fix) {
        lines.push(`  Fix: ${warning.fix}`);
      }
    }
  }

  if (issues.length === 0 && warnings.length === 0) {
    lines.push('\n✓ All anti-pattern checks passed!');
  }

  lines.push('\n' + '='.repeat(60) + '\n');

  return lines.join('\n');
}

// Export for Claude Code hooks system
module.exports = validateAntiPatterns;

// Allow running directly for testing
if (require.main === module) {
  const result = validateAntiPatterns({ cwd: process.cwd() });

  if (result.block) {
    console.log('\nValidation would BLOCK with message:');
    console.log(result.message);
    process.exit(1);
  } else {
    console.log('\nValidation would PASS');
    process.exit(0);
  }
}
