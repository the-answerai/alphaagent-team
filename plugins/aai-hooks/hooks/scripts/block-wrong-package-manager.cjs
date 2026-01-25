#!/usr/bin/env node
/**
 * Block Wrong Package Manager Hook
 *
 * Detects the project's package manager from lock files and blocks
 * npm commands when pnpm, yarn, or bun should be used instead.
 *
 * Usage:
 *   Automatically triggered by Claude Code hooks system when:
 *   - Tool: Bash
 *   - Pattern: "npm " (note the space to avoid matching "pnpm")
 *
 * Exit codes:
 *   0 - Allow (npm is correct or not a package management command)
 *   2 - Block (wrong package manager detected)
 */

const fs = require('fs');

/**
 * Read stdin for hook input
 */
function readStdin() {
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
 * Main hook execution
 */
async function main() {
  try {
    const stdinData = await readStdin();
    let command = '';

    try {
      const input = JSON.parse(stdinData);
      command = input.tool_input?.command || '';
    } catch {
      command = stdinData || '';
    }

    // Check if this is an npm command (but not npx which is fine)
    const isNpmCommand = /\bnpm\s+(install|i|add|remove|rm|uninstall|run|test|start|build|ci)\b/.test(command);

    if (!isNpmCommand) {
      // Not an npm package management command, allow
      process.exit(0);
    }

    // Check if using npm when pnpm is the project's package manager
    if (fs.existsSync('pnpm-lock.yaml')) {
      console.error(`⛔ BLOCKED: This project uses pnpm (pnpm-lock.yaml exists).

Use pnpm instead of npm:
  npm install  → pnpm install
  npm test     → pnpm test
  npm run X    → pnpm X
  npm i pkg    → pnpm add pkg
`);
      process.exit(2);
    }

    // Check if using npm when yarn is the package manager
    if (fs.existsSync('yarn.lock')) {
      console.error(`⛔ BLOCKED: This project uses yarn (yarn.lock exists).

Use yarn instead of npm:
  npm install  → yarn install
  npm test     → yarn test
  npm run X    → yarn X
  npm i pkg    → yarn add pkg
`);
      process.exit(2);
    }

    // Check if using npm when bun is the package manager
    if (fs.existsSync('bun.lockb')) {
      console.error(`⛔ BLOCKED: This project uses bun (bun.lockb exists).

Use bun instead of npm:
  npm install  → bun install
  npm test     → bun test
  npm run X    → bun X
  npm i pkg    → bun add pkg
`);
      process.exit(2);
    }

    // npm is correct or no lock file exists
    process.exit(0);
  } catch (error) {
    // Don't block on hook errors, just continue
    console.error(`[block-wrong-package-manager] Warning: ${error.message}`);
    process.exit(0);
  }
}

main();
