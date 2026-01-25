#!/usr/bin/env node
/**
 * Project Context Injection Hook
 *
 * Detects project configuration and provides it to Claude.
 * Eliminates redundant package.json reads and npm vs pnpm confusion.
 *
 * Usage:
 *   Automatically triggered by Claude Code hooks system when:
 *   - Event: PreToolUse (Bash commands)
 *
 * Output:
 *   Returns context summary for agent consumption via stdout JSON
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Detects the package manager used by the project
 */
function detectPackageManager() {
  // Check lock files (most reliable)
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('bun.lockb')) return 'bun';
  if (fs.existsSync('package-lock.json')) return 'npm';

  // Check package.json packageManager field
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    if (pkg.packageManager) {
      if (pkg.packageManager.startsWith('pnpm')) return 'pnpm';
      if (pkg.packageManager.startsWith('yarn')) return 'yarn';
      if (pkg.packageManager.startsWith('bun')) return 'bun';
    }
  } catch {
    // package.json doesn't exist or is invalid
  }

  return 'npm'; // Default fallback
}

/**
 * Gets the current git branch
 */
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Gets the repository name from git
 */
function getRepoName() {
  try {
    const repoPath = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8', stdio: 'pipe' }).trim();
    return path.basename(repoPath);
  } catch {
    return path.basename(process.cwd());
  }
}

/**
 * Checks if git working directory is clean
 */
function isGitClean() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8', stdio: 'pipe' });
    return status.trim() === '';
  } catch {
    return false;
  }
}

/**
 * Detects the technology stack from package.json
 */
function detectStack() {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    return {
      frontend: deps['react'] ? 'React' : deps['vue'] ? 'Vue' : deps['svelte'] ? 'Svelte' : deps['angular'] ? 'Angular' : null,
      backend: deps['express'] ? 'Express' : deps['fastify'] ? 'Fastify' : deps['hono'] ? 'Hono' : deps['koa'] ? 'Koa' : null,
      testing: {
        unit: deps['jest'] ? 'Jest' : deps['vitest'] ? 'Vitest' : deps['mocha'] ? 'Mocha' : null,
        e2e: deps['@playwright/test'] ? 'Playwright' : deps['cypress'] ? 'Cypress' : null,
      },
      database: deps['prisma'] ? 'Prisma' : deps['typeorm'] ? 'TypeORM' : deps['better-sqlite3'] ? 'SQLite' : deps['pg'] ? 'PostgreSQL' : deps['mongodb'] ? 'MongoDB' : null,
      typescript: !!deps['typescript'],
      nextjs: !!deps['next'],
      tailwind: !!deps['tailwindcss'],
    };
  } catch {
    return {};
  }
}

/**
 * Detects and builds the full project context
 */
function detectProjectContext() {
  const projectRoot = process.cwd();
  const packageManager = detectPackageManager();

  return {
    packageManager,
    commands: {
      install: `${packageManager} install`,
      test: `${packageManager} test`,
      build: `${packageManager} build`,
      lint: `${packageManager} lint`,
      dev: `${packageManager} dev`,
    },
    paths: {
      projectRoot,
    },
    git: {
      branch: getCurrentBranch(),
      repoName: getRepoName(),
      isClean: isGitClean(),
    },
    stack: detectStack(),
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Main hook execution
 */
function main() {
  try {
    const context = detectProjectContext();

    // Output context summary for agent consumption
    const summary = {
      decision: 'continue',
      PROJECT_CONTEXT: {
        packageManager: context.packageManager,
        commands: context.commands,
        git: context.git,
        stack: context.stack,
      },
    };

    console.log(JSON.stringify(summary));
  } catch (error) {
    // Don't block on errors
    console.log(JSON.stringify({
      decision: 'continue',
      warning: `Context detection failed: ${error.message}`,
    }));
  }
}

main();
