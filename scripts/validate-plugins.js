#!/usr/bin/env node
/**
 * Plugin Validation Script
 *
 * Validates plugin structure and manifest files against the Claude Code plugin schema.
 *
 * Usage:
 *   node scripts/validate-plugins.js                    # Validate all plugins
 *   node scripts/validate-plugins.js plugins/aai-core   # Validate single plugin
 */

const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '..', 'plugins');

// Required plugin.json fields
const REQUIRED_FIELDS = ['name'];

// Valid plugin categories
const VALID_CATEGORIES = [
  'workflow', 'pm', 'dev', 'stack', 'testing',
  'architecture', 'docs', 'blog', 'devops', 'quality'
];

// Results tracking
const results = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Validate a single plugin
 */
function validatePlugin(pluginPath) {
  const pluginName = path.basename(pluginPath);
  const errors = [];
  const warnings = [];

  console.log(`\nValidating: ${pluginName}`);

  // Check .claude-plugin directory exists
  const claudePluginDir = path.join(pluginPath, '.claude-plugin');
  if (!fs.existsSync(claudePluginDir)) {
    errors.push('Missing .claude-plugin/ directory');
    return { pluginName, errors, warnings };
  }

  // Check plugin.json exists
  const manifestPath = path.join(claudePluginDir, 'plugin.json');
  if (!fs.existsSync(manifestPath)) {
    errors.push('Missing .claude-plugin/plugin.json');
    return { pluginName, errors, warnings };
  }

  // Parse and validate plugin.json
  let manifest;
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(content);
  } catch (e) {
    errors.push(`Invalid JSON in plugin.json: ${e.message}`);
    return { pluginName, errors, warnings };
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!manifest[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate name format (kebab-case)
  if (manifest.name && !/^[a-z][a-z0-9-]*$/.test(manifest.name)) {
    errors.push(`Invalid name format: ${manifest.name} (must be kebab-case)`);
  }

  // Check name matches directory
  if (manifest.name && manifest.name !== pluginName) {
    warnings.push(`Plugin name '${manifest.name}' doesn't match directory '${pluginName}'`);
  }

  // Validate version format
  if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
    warnings.push(`Version '${manifest.version}' doesn't follow semver`);
  }

  // Check for description
  if (!manifest.description) {
    warnings.push('Missing description field');
  }

  // Validate components exist if referenced
  const componentsToCheck = [
    { field: 'agents', dir: 'agents', ext: '.md' },
    { field: 'skills', dir: 'skills', ext: 'SKILL.md' },
    { field: 'commands', dir: 'commands', ext: '.md' },
  ];

  for (const { dir } of componentsToCheck) {
    const componentDir = path.join(pluginPath, dir);
    if (fs.existsSync(componentDir)) {
      const files = fs.readdirSync(componentDir);
      if (files.length === 0) {
        warnings.push(`Empty ${dir}/ directory`);
      }
    }
  }

  // Validate hooks if present
  const hooksPath = path.join(pluginPath, 'hooks', 'hooks.json');
  if (fs.existsSync(hooksPath)) {
    try {
      const hooksContent = fs.readFileSync(hooksPath, 'utf-8');
      JSON.parse(hooksContent);
    } catch (e) {
      errors.push(`Invalid JSON in hooks/hooks.json: ${e.message}`);
    }
  }

  // Validate agents frontmatter
  const agentsDir = path.join(pluginPath, 'agents');
  if (fs.existsSync(agentsDir)) {
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    for (const agentFile of agentFiles) {
      const agentPath = path.join(agentsDir, agentFile);
      const agentContent = fs.readFileSync(agentPath, 'utf-8');

      // Check for frontmatter
      if (!agentContent.startsWith('---')) {
        errors.push(`Agent ${agentFile} missing YAML frontmatter`);
        continue;
      }

      // Check for required frontmatter fields
      const frontmatterMatch = agentContent.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        if (!frontmatter.includes('name:')) {
          errors.push(`Agent ${agentFile} missing 'name' in frontmatter`);
        }
        if (!frontmatter.includes('description:')) {
          errors.push(`Agent ${agentFile} missing 'description' in frontmatter`);
        }
      }
    }
  }

  // Validate skills SKILL.md files
  const skillsDir = path.join(pluginPath, 'skills');
  if (fs.existsSync(skillsDir)) {
    const skillDirs = fs.readdirSync(skillsDir).filter(f =>
      fs.statSync(path.join(skillsDir, f)).isDirectory()
    );
    for (const skillDir of skillDirs) {
      const skillMdPath = path.join(skillsDir, skillDir, 'SKILL.md');
      if (!fs.existsSync(skillMdPath)) {
        errors.push(`Skill ${skillDir}/ missing SKILL.md`);
        continue;
      }

      const skillContent = fs.readFileSync(skillMdPath, 'utf-8');
      if (!skillContent.startsWith('---')) {
        warnings.push(`Skill ${skillDir}/SKILL.md missing frontmatter`);
      }
    }
  }

  return { pluginName, errors, warnings };
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  let pluginsToValidate = [];

  if (args.length > 0) {
    // Validate specific plugin(s)
    for (const arg of args) {
      const pluginPath = path.resolve(arg);
      if (fs.existsSync(pluginPath) && fs.statSync(pluginPath).isDirectory()) {
        pluginsToValidate.push(pluginPath);
      } else {
        console.error(`Error: Plugin not found: ${arg}`);
        process.exit(1);
      }
    }
  } else {
    // Validate all plugins
    if (!fs.existsSync(PLUGINS_DIR)) {
      console.error('Error: plugins/ directory not found');
      process.exit(1);
    }

    const plugins = fs.readdirSync(PLUGINS_DIR).filter(f =>
      fs.statSync(path.join(PLUGINS_DIR, f)).isDirectory()
    );

    pluginsToValidate = plugins.map(p => path.join(PLUGINS_DIR, p));
  }

  console.log(`Validating ${pluginsToValidate.length} plugin(s)...\n`);
  console.log('='.repeat(50));

  for (const pluginPath of pluginsToValidate) {
    const result = validatePlugin(pluginPath);

    if (result.errors.length > 0) {
      results.failed.push(result);
      console.log(`  ❌ FAILED`);
      for (const error of result.errors) {
        console.log(`     Error: ${error}`);
      }
    } else {
      results.passed.push(result);
      console.log(`  ✅ PASSED`);
    }

    if (result.warnings.length > 0) {
      results.warnings.push(...result.warnings.map(w => `${result.pluginName}: ${w}`));
      for (const warning of result.warnings) {
        console.log(`     Warning: ${warning}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\nValidation Summary:');
  console.log(`  ✅ Passed: ${results.passed.length}`);
  console.log(`  ❌ Failed: ${results.failed.length}`);
  console.log(`  ⚠️  Warnings: ${results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed plugins:');
    for (const failure of results.failed) {
      console.log(`  - ${failure.pluginName}`);
    }
    process.exit(1);
  }

  console.log('\n✅ All plugins validated successfully!');
}

main();
