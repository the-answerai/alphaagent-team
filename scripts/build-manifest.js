#!/usr/bin/env node
/**
 * Plugin Manifest Builder
 *
 * Generates plugin-manifest.json from all plugins in the plugins/ directory.
 * This manifest is used by AlphaAgent for plugin discovery and installation.
 *
 * Usage:
 *   node scripts/build-manifest.js
 */

const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '..', 'plugins');
const OUTPUT_PATH = path.join(__dirname, '..', 'plugin-manifest.json');

/**
 * Get plugin metadata
 */
function getPluginMetadata(pluginPath) {
  const pluginName = path.basename(pluginPath);
  const manifestPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');

  if (!fs.existsSync(manifestPath)) {
    console.warn(`  Warning: ${pluginName} missing plugin.json, skipping`);
    return null;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Count components
    const components = {
      agents: 0,
      skills: 0,
      commands: 0,
      hooks: false
    };

    // Count agents
    const agentsDir = path.join(pluginPath, 'agents');
    if (fs.existsSync(agentsDir)) {
      components.agents = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length;
    }

    // Count skills
    const skillsDir = path.join(pluginPath, 'skills');
    if (fs.existsSync(skillsDir)) {
      components.skills = fs.readdirSync(skillsDir).filter(f =>
        fs.statSync(path.join(skillsDir, f)).isDirectory()
      ).length;
    }

    // Count commands
    const commandsDir = path.join(pluginPath, 'commands');
    if (fs.existsSync(commandsDir)) {
      components.commands = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md')).length;
    }

    // Check for hooks
    const hooksPath = path.join(pluginPath, 'hooks', 'hooks.json');
    components.hooks = fs.existsSync(hooksPath);

    // Determine category from name
    let category = 'other';
    if (pluginName.startsWith('aai-stack-')) category = 'stack';
    else if (pluginName.startsWith('aai-pm-')) category = 'pm';
    else if (pluginName.startsWith('aai-dev-')) category = 'dev';
    else if (pluginName === 'aai-core' || pluginName === 'aai-hooks') category = 'workflow';
    else if (pluginName === 'aai-testing') category = 'testing';
    else if (pluginName === 'aai-architecture') category = 'architecture';
    else if (pluginName === 'aai-docs') category = 'docs';
    else if (pluginName === 'aai-blog') category = 'blog';
    else if (pluginName === 'aai-devops') category = 'devops';
    else if (pluginName === 'aai-quality') category = 'quality';

    return {
      name: manifest.name || pluginName,
      version: manifest.version || '1.0.0',
      description: manifest.description || '',
      category,
      source: `./plugins/${pluginName}`,
      keywords: manifest.keywords || [],
      author: manifest.author,
      components,
      requires: manifest.requires || {},
      recommends: manifest.recommends || {},
      autoLoad: manifest.autoLoad || null
    };
  } catch (e) {
    console.warn(`  Warning: Error reading ${pluginName}: ${e.message}`);
    return null;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('Building plugin manifest...\n');

  if (!fs.existsSync(PLUGINS_DIR)) {
    console.error('Error: plugins/ directory not found');
    process.exit(1);
  }

  const plugins = fs.readdirSync(PLUGINS_DIR).filter(f =>
    fs.statSync(path.join(PLUGINS_DIR, f)).isDirectory()
  );

  console.log(`Found ${plugins.length} plugins\n`);

  const manifestEntries = [];

  for (const pluginDir of plugins.sort()) {
    const pluginPath = path.join(PLUGINS_DIR, pluginDir);
    console.log(`Processing: ${pluginDir}`);

    const metadata = getPluginMetadata(pluginPath);
    if (metadata) {
      manifestEntries.push(metadata);
      console.log(`  ✅ Added to manifest`);
    }
  }

  // Build manifest
  const manifest = {
    $schema: 'https://claude.ai/schemas/plugin-manifest.json',
    name: 'alphaagent-team',
    displayName: 'AlphaAgent Team Plugin Marketplace',
    description: 'Official plugin marketplace for AlphaAgent - autonomous coding assistant plugins',
    version: '1.0.0',
    author: {
      name: 'AnswerAI',
      url: 'https://github.com/the-answerai'
    },
    repository: 'https://github.com/the-answerai/alphaagent-team',
    plugins: manifestEntries,
    generatedAt: new Date().toISOString()
  };

  // Write manifest
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\n${'='.repeat(50)}`);
  console.log(`\n✅ Generated plugin-manifest.json`);
  console.log(`   Plugins: ${manifestEntries.length}`);
  console.log(`   Output: ${OUTPUT_PATH}`);

  // Summary by category
  console.log('\nPlugins by category:');
  const byCategory = {};
  for (const plugin of manifestEntries) {
    byCategory[plugin.category] = (byCategory[plugin.category] || 0) + 1;
  }
  for (const [category, count] of Object.entries(byCategory).sort()) {
    console.log(`   ${category}: ${count}`);
  }
}

main();
